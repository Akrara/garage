from flask import Flask, jsonify, request
import psycopg2
from datetime import datetime, timezone

app = Flask(__name__)

DB_HOST = 'localhost'
DB_NAME = 'interview'
DB_USER = 'postgres'
DB_PASSWORD = 'admin'
DB_PORT = '5001'


def connect_to_db():
    conn = psycopg2.connect(
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT
    )
    return conn


def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    return response


@app.after_request
def apply_cors(response):
    return add_cors_headers(response)


@app.route("/list", methods=['GET'])
def get_slots():
    level = request.args.get("level-id")
    conn = connect_to_db()
    cur = conn.cursor()
    cur.execute(f"""SELECT * FROM parking_slots WHERE level_id={level} ORDER BY 
        CASE
            WHEN plate IS NULL THEN 0  -- prioritize NULL values first
            ELSE 1  -- prioritize non-NULL values second
        END,
        -- Split the column value into parts and order based on them
        split_part(slot_id, '-', 1)::integer,
    split_part(slot_id, '-', 2)::integer,
    split_part(slot_id, '-', 3)""")
    data = cur.fetchall()
    conn.close()
    return jsonify(data)


@app.route("/levels", methods=['GET'])
def get_levels():
    conn = connect_to_db()
    cur = conn.cursor()
    cur.execute('SELECT level_id FROM levels ORDER BY level_id ASC')
    data = cur.fetchall()
    conn.close()
    return jsonify(data)


@app.route("/levels/all", methods=['GET'])
def get_all_levels():
    conn = connect_to_db()
    cur = conn.cursor()
    cur.execute('SELECT * FROM levels ORDER BY level_id ASC')
    data = cur.fetchall()
    conn.close()
    return jsonify(data)


@app.route("/levels/add", methods=['PUT'])
def add_level():
    data = request.json
    if data:
        level_id = data.get('level_id')
        car_slots = data.get('total_car_slots')
        motorbike_slots = data.get('total_motorbike_slots')
        conn = connect_to_db()
        cur = conn.cursor()
        query = "SELECT level_id FROM levels WHERE level_id=%s"
        cur.execute(query, (level_id,))
        conn.commit()
        test = cur.fetchall()
        if len(test) > 0:
            conn.close()
            return "Level ID already existed", 400
        query2 = """
        INSERT INTO levels (level_id,total_car_slot,total_motorbike_slot)
        VALUES (%s,%s,%s)
                  """
        cur.execute(query2, (level_id, car_slots, motorbike_slots,))
        conn.commit()

        car_slot_ids = []
        motorbike_slot_ids = []
        for i in range(int(car_slots)):
            car_slot_ids.append(f'{level_id}-{i+1}-C')
        for i in range(int(motorbike_slots)):
            motorbike_slot_ids.append(f'{level_id}-{i+1}-M')

        joined_ids = car_slot_ids + motorbike_slot_ids
        tup = [(value, level_id, None, False if value[-1] == 'M' else True, None,) for value in joined_ids]
        args_str = ','.join(cur.mogrify('(%s,%s,%s,%s,%s)', x).decode('utf-8') for x in tup)
        cur.execute("INSERT INTO parking_slots VALUES " + args_str)
        conn.commit()
        conn.close()
        return "finished"
    else:
        return "Empty request", 400


@app.route("/levels/delete", methods=['DELETE'])
def delete_level():
    data = request.json
    if data:
        level_id = data.get('level_id')
        conn = connect_to_db()
        cur = conn.cursor()
        query = "SELECT level_id FROM levels WHERE level_id=%s"
        cur.execute(query, (level_id,))
        conn.commit()
        test = cur.fetchall()
        if len(test) == 0:
            conn.close()
            return "Level ID doesn't exist", 400
        query2 = "DELETE FROM levels WHERE level_id=%s"
        cur.execute(query2, (level_id,))
        conn.commit()
        conn.close()
        return "finished"
    else:
        return "Empty request", 400


@app.route("/level/remains", methods=['GET'])
def get_remaining_vehicles():
    level_id = request.args.get("level-id")
    conn = connect_to_db()
    cur = conn.cursor()
    cur.execute("SELECT plate FROM parking_slots WHERE level_id=%s AND plate IS NOT NULL", (level_id,))
    test = cur.fetchall()
    conn.close()
    return jsonify(test)


@app.route("/slot/add", methods=['PUT'])
def get_free_slot():
    data = request.json
    if data:
        plate = data.get('plate')
        vehicle_type = data.get('type')
        conn = connect_to_db()
        cur = conn.cursor()
        query = "SELECT slot_id FROM parking_slots WHERE plate=%s"
        cur.execute(query, (plate,))
        conn.commit()
        test = cur.fetchall()
        if len(test) > 0:
            conn.close()
            return "Plate already existed inside garage", 400
        cur.execute("""SELECT slot_id FROM parking_slots WHERE plate IS NULL AND is_car=%s ORDER BY
        split_part(slot_id, '-', 1)::integer,
        split_part(slot_id, '-', 2)::integer,
        split_part(slot_id, '-', 3)
        LIMIT 1
        """, (vehicle_type,))
        conn.commit()
        data = cur.fetchall()
        if len(data) == 1:
            slot = data[0][0]
            ct = datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S')
            query = "UPDATE parking_slots SET plate=%s,park_date=%s WHERE slot_id=%s"
            values = (plate, ct, slot)
            cur.execute(query, values)
            conn.commit()
            conn.close()
            return "finished"
        else:
            conn.close()
            return "No free slots", 400
    else:
        return "No data", 400


@app.route("/slot/delete", methods=['DELETE'])
def remove_vehicle():
    data = request.json
    if data:
        plate = data.get('plate')
        conn = connect_to_db()
        cur = conn.cursor()
        query = "SELECT slot_id FROM parking_slots WHERE plate=%s"
        cur.execute(query, (plate,))
        temp_data = cur.fetchall()
        if len(temp_data) == 1:
            slot = temp_data[0][0]
            query = "UPDATE parking_slots SET plate=NULL,park_date=NULL WHERE slot_id=%s"
            cur.execute(query, (slot,))
            conn.commit()
            conn.close()
            return "finished"
        else:
            conn.close()
            return "Error: multiple identical plates inside garage", 400
    else:
        return "No data", 400


@app.route("/vehicles/all", methods=['GET'])
def get_all_vehicles():
    conn = connect_to_db()
    cur = conn.cursor()
    cur.execute("SELECT plate,is_car,park_date,slot_id,level_id FROM parking_slots WHERE plate IS NOT NULL")
    data = cur.fetchall()
    conn.close()
    return jsonify(data)
