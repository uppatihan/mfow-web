import os
import oracledb
from typing import List
from dotenv import load_dotenv

# โหลด .env ที่อยู่ระดับโฟลเดอร์โปรเจกต์ (สมมติว่า .env อยู่ข้างนอกโฟลเดอร์ backend)
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "../.env"))

def get_connection():
    # พิมพ์ค่า env เพื่อเช็คว่าถูกโหลดจริงไหม
    # print("USER:", os.getenv("ORA_USER"))
    # print("PASSWORD:", os.getenv("ORA_PASSWORD"))
    # print("DSN:", os.getenv("ORA_DSN"))

    return oracledb.connect(
        user=os.getenv("ORA_USER"),
        password=os.getenv("ORA_PASSWORD"),
        dsn=os.getenv("ORA_DSN")
    )

# ✅ ฟังก์ชันตรวจสอบการชำระเงิน
def get_db_data_by_ref_and_date(ref, date_str):
    conn = get_connection()
    cursor = conn.cursor()

    if len(ref) == 4:
        query = """
		WITH CombinedData AS (
        SELECT 
            A.CREATE_DATE, C.TRANSACTION_DATE,
            B.PLATE1 || ' ' || B.PLATE2 || ' ' || V.DESCRIPTION AS LICENSE,
            B.PAYMENT_DATE, A.REF_GROUP_INVOICE, A.INVOICE_NO,
            B.FEE_AMOUNT, B.FINE_AMOUNT, B.TOTAL_AMOUNT, B.STATUS
        FROM INVOICE_SERVICE.MF_INVOICE_NONMEMBER_LOG_REF_GROUP_INVOICE A
        JOIN INVOICE_SERVICE.MF_INVOICE_NONMEMBER B ON A.INVOICE_NO = B.INVOICE_NO
        JOIN INVOICE_SERVICE.MF_INVOICE_DETAIL_NONMEMBER C ON B.INVOICE_NO = C.INVOICE_NO
        JOIN CUSTOMER_SERVICE.MF_CUST_MASTER_VEHICLE_OFFICE V ON B.PROVINCE = V.CODE
        UNION ALL
        SELECT 
            A.CREATE_DATE, C.TRANSACTION_DATE,
            B.PLATE1 || ' ' || B.PLATE2 || ' ' || V.DESCRIPTION AS LICENSE,
            B.PAYMENT_DATE, A.REF_GROUP_INVOICE, A.INVOICE_NO,
            B.FEE_AMOUNT, B.COLLECTION_AMOUNT, B.TOTAL_AMOUNT, B.STATUS
        FROM INVOICE_SERVICE.MF_INVOICE_LOG_REF_GROUP_INVOICE A
        JOIN INVOICE_SERVICE.MF_INVOICE B ON A.INVOICE_NO = B.INVOICE_NO
        JOIN INVOICE_SERVICE.MF_INVOICE_DETAIL C ON B.INVOICE_NO = C.INVOICE_NO
        JOIN CUSTOMER_SERVICE.MF_CUST_MASTER_VEHICLE_OFFICE V ON B.PROVINCE = V.CODE
        )
        SELECT *
        FROM CombinedData
        WHERE SUBSTR(REF_GROUP_INVOICE, -4) = :ref_group
        AND TRUNC(CREATE_DATE) = TO_DATE(:pay_date, 'YYYY-MM-DD')
        ORDER BY COMBINEDDATA.TRANSACTION_DATE DESC
        """
    else:
        query = """
		WITH CombinedData AS (
        SELECT 
            A.CREATE_DATE, C.TRANSACTION_DATE,
            B.PLATE1 || ' ' || B.PLATE2 || ' ' || V.DESCRIPTION AS LICENSE,
            B.PAYMENT_DATE, A.REF_GROUP_INVOICE, A.INVOICE_NO,
            B.FEE_AMOUNT, B.FINE_AMOUNT, B.TOTAL_AMOUNT, B.STATUS
        FROM INVOICE_SERVICE.MF_INVOICE_NONMEMBER_LOG_REF_GROUP_INVOICE A
        JOIN INVOICE_SERVICE.MF_INVOICE_NONMEMBER B ON A.INVOICE_NO = B.INVOICE_NO
        JOIN INVOICE_SERVICE.MF_INVOICE_DETAIL_NONMEMBER C ON B.INVOICE_NO = C.INVOICE_NO
        JOIN CUSTOMER_SERVICE.MF_CUST_MASTER_VEHICLE_OFFICE V ON B.PROVINCE = V.CODE
        UNION ALL
        SELECT 
            A.CREATE_DATE, C.TRANSACTION_DATE,
            B.PLATE1 || ' ' || B.PLATE2 || ' ' || V.DESCRIPTION AS LICENSE,
            B.PAYMENT_DATE, A.REF_GROUP_INVOICE, A.INVOICE_NO,
            B.FEE_AMOUNT, B.COLLECTION_AMOUNT, B.TOTAL_AMOUNT, B.STATUS
        FROM INVOICE_SERVICE.MF_INVOICE_LOG_REF_GROUP_INVOICE A
        JOIN INVOICE_SERVICE.MF_INVOICE B ON A.INVOICE_NO = B.INVOICE_NO
        JOIN INVOICE_SERVICE.MF_INVOICE_DETAIL C ON B.INVOICE_NO = C.INVOICE_NO
        JOIN CUSTOMER_SERVICE.MF_CUST_MASTER_VEHICLE_OFFICE V ON B.PROVINCE = V.CODE
        )
        SELECT *
        FROM CombinedData
        WHERE TRIM(REF_GROUP_INVOICE) = :ref_group
        AND TRUNC(CREATE_DATE) = TO_DATE(:pay_date, 'YYYY-MM-DD')
        ORDER BY COMBINEDDATA.TRANSACTION_DATE DESC
        """
    cursor.execute(query, {"ref_group": ref, "pay_date": date_str})
    rows = cursor.fetchall()
    columns = [col[0].lower() for col in cursor.description]
    return [dict(zip(columns, row)) for row in rows]

# ✅ ฟังก์ชันค้นหา Car Balance
def get_car_balance_by_customer_id(customer_id):
    conn = get_connection()
    cursor = conn.cursor()

    query = """
        SELECT
            ma.FULL_NAME AS COMPANY_NAME, 
            TO_CHAR(mcvi.CREATE_DATE, 'DD/MM/YYYY') AS DATE_CREATE,
            TO_CHAR(mcvi.CREATE_DATE, 'HH24:MI:SS') AS TIME_CREATE,
            mcvi.PLATE1, 
            mcvi.PLATE2, 
            mcmvo.DESCRIPTION AS PROVINCE,
            CASE 
                WHEN mcvi.DELETE_FLAG = 1 OR mcvi.DRAFT_FLAG = 1 THEN 'INACTIVE'
                WHEN mcvi.DELETE_FLAG = 0 THEN 'ACTIVE'
            END AS STATUS,
            mcvi.CREATE_BY,
            mcvi.CREATE_BY_ID,
            TO_CHAR(mcvi.UPDATE_DATE, 'DD/MM/YYYY') AS DATE_UPDATE,
            TO_CHAR(mcvi.UPDATE_DATE, 'HH24:MI:SS') AS TIME_UPDATE,
            mcvi.UPDATE_BY,
            mcvi.UPDATE_BY_ID 
        FROM CUSTOMER_SERVICE.MF_CUST_VEHICLE_INFO mcvi 
        LEFT JOIN CUSTOMER_SERVICE.MF_CUST_MASTER_VEHICLE_OFFICE mcmvo ON mcvi.PROVINCE = mcmvo.CODE
        LEFT JOIN AUTH_SERVICE.MF_AUTHENTICATION ma ON ma.ACCOUNT_ID = mcvi.CUSTOMER_ID
        WHERE mcvi.CUSTOMER_ID = :customer_id
          AND mcvi.DELETE_FLAG = 0  
        ORDER BY 
            mcvi.PLATE1, 
            mcvi.PLATE2, 
            mcmvo.DESCRIPTION,
            mcvi.CREATE_DATE
    """
    cursor.execute(query, {"customer_id": customer_id})
    rows = cursor.fetchall()
    columns = [col[0].lower() for col in cursor.description]
    return [dict(zip(columns, row)) for row in rows]

# ✅ ฟังก์ชันค้นหา SumTransection
def get_summary_by_customer_id_and_date(customer_id, start_date, end_date):
    conn = get_connection()
    cursor = conn.cursor()

    query = """
        SELECT 
            a.FULL_NAME AS company_name, TO_CHAR(b.TRANSACTION_DATE,'DD/MM/YYYY') AS tran_date, TO_CHAR(b.TRANSACTION_DATE,'HH24:MI:SS') AS tran_time,
            mcmp2.NAME AS PLAZA, mcml.NAME AS LANE, b.PLATE1 , b.PLATE2, mcmvo2.DESCRIPTION AS PROVINCE, 
            CASE 
                WHEN a.INVOICE_TYPE = 0 THEN 'ค่าผ่านทาง' 
                WHEN a.INVOICE_TYPE = 1 THEN 'ค่าผ่านทาง+ค่าปรับ'
            END AS TYPE_INV,
            b.TOTAL_AMOUNT, a.TOTAL_AMOUNT AS bill_AMOUNT, a.INVOICE_NO, 
            CASE 
                WHEN a.INVOICE_CHANNEL = 'BILL_TIME' THEN 'รายครั้ง'
                WHEN a.INVOICE_CHANNEL = 'BILL_CYCLE' THEN 'รายรอบบิล'
            END AS INVOICE_CHANNEL, 
            a.STATUS, TO_CHAR(a.CREATE_DATE,'DD/MM/YYYY') AS INV_DATE, TO_CHAR(a.CREATE_DATE,'HH24:MI:SS') AS INV_TIME,
            TO_CHAR(a.PAYMENT_DATE,'DD/MM/YYYY') AS PAYMENT_DATE, TO_CHAR(a.PAYMENT_DATE,'HH24:MI:SS') AS PAYMENT_TIME,
            a.RECEIPT_NO, a.RECEIPT_FILE_ID, a.REF_GROUP
        FROM INVOICE_SERVICE.MF_INVOICE a 
        LEFT JOIN INVOICE_SERVICE.MF_INVOICE_DETAIL b ON a.INVOICE_NO = b.INVOICE_NO 
        LEFT JOIN CUSTOMER_SERVICE.MF_CUST_MASTER_PLAZA mcmp2 ON mcmp2.CODE  = b.PLAZA_CODE
        LEFT JOIN CUSTOMER_SERVICE.MF_CUST_MASTER_LANE mcml ON mcml.CODE = b.LANE_CODE
        LEFT JOIN CUSTOMER_SERVICE.MF_CUST_MASTER_VEHICLE_OFFICE mcmvo2 ON mcmvo2.CODE = b.PROVINCE
        WHERE a.CUSTOMER_ID = :customer_id 
          AND a.DELETE_FLAG = 0 
          AND b.DELETE_FLAG = 0 
          AND a.INVOICE_TYPE IN (0,1)
          AND TO_CHAR(b.TRANSACTION_DATE ,'YYYY-MM-DD') >= :start_date
          AND TO_CHAR(b.TRANSACTION_DATE ,'YYYY-MM-DD') <= :end_date
        ORDER BY b.PLATE1, b.PLATE2, b.PROVINCE, b.TRANSACTION_DATE
    """
    cursor.execute(query, {
        "customer_id": customer_id,
        "start_date": start_date,
        "end_date": end_date
    })
    rows = cursor.fetchall()
    columns = [col[0].lower() for col in cursor.description]
    return [dict(zip(columns, row)) for row in rows]

# ✅ ฟังก์ชันค้นหา Invoice Member
def search_member_invoices(plate1, plate2, province, invoice_no, status, start_date, end_date):
    conn = get_connection()
    cursor = conn.cursor()

    query = """
        SELECT a.E_BILL_FILE_ID, b.TRANSACTION_DATE, a.INVOICE_NO, a.INVOICE_NO_REF,
               a.STATUS, a.INVOICE_TYPE, a.FEE_AMOUNT, a.COLLECTION_AMOUNT, 
               a.DISCOUNT, a.TOTAL_AMOUNT
        FROM INVOICE_SERVICE.MF_INVOICE a
        LEFT JOIN INVOICE_SERVICE.MF_INVOICE_DETAIL b ON a.INVOICE_NO = b.INVOICE_NO
        WHERE a.DELETE_FLAG = 0
          AND a.FEE_AMOUNT > 0
          AND a.INVOICE_TYPE != '3'
    """
    params = {}
    if plate1:
        query += " AND a.PLATE1 = :plate1"
        params["plate1"] = plate1.strip()
    if plate2:
        query += " AND a.PLATE2 = :plate2"
        params["plate2"] = plate2.strip()
    if province:
        query += " AND a.PROVINCE = :province"
        params["province"] = province.strip()
    if invoice_no:
        query += " AND a.INVOICE_NO = :invoice_no"
        params["invoice_no"] = invoice_no.strip()
    if status:
        query += " AND a.STATUS = :status"
        params["status"] = status.strip()
    if start_date and end_date:
        query += " AND TO_CHAR(b.TRANSACTION_DATE, 'YYYY-MM-DD') BETWEEN :start_date AND :end_date"
        params["start_date"] = start_date.strip()
        params["end_date"] = end_date.strip()

    query += " ORDER BY b.TRANSACTION_DATE DESC"

    cursor.execute(query, params)
    rows = cursor.fetchall()
    columns = [col[0].lower() for col in cursor.description]
    return [dict(zip(columns, row)) for row in rows]

# ✅ ฟังก์ชันค้นหา Invoice NonMember
def search_nonmember_invoices(plate1, plate2, province, invoice_no, status, start_date, end_date):
    conn = get_connection()
    cursor = conn.cursor()

    query = """
        SELECT a.E_BILL_FILE_ID, b.TRANSACTION_DATE, a.INVOICE_NO, a.INVOICE_NO_REF,
               a.STATUS, a.INVOICE_TYPE, a.FEE_AMOUNT, a.COLLECTION_AMOUNT, 
               a.DISCOUNT, a.TOTAL_AMOUNT
        FROM INVOICE_SERVICE.MF_INVOICE_NONMEMBER a
        LEFT JOIN INVOICE_SERVICE.MF_INVOICE_DETAIL_NONMEMBER b ON a.INVOICE_NO = b.INVOICE_NO
        WHERE a.DELETE_FLAG = 0
          AND a.FEE_AMOUNT > 0
          AND a.INVOICE_TYPE != '3'
    """

    params = {}
    if plate1:
        query += " AND a.PLATE1 = :plate1"
        params["plate1"] = plate1.strip()
    if plate2:
        query += " AND a.PLATE2 = :plate2"
        params["plate2"] = plate2.strip()
    if province:
        query += " AND a.PROVINCE = :province"
        params["province"] = province.strip()
    if invoice_no:
        query += " AND a.INVOICE_NO = :invoice_no"
        params["invoice_no"] = invoice_no.strip()
    if status:
        query += " AND a.STATUS = :status"
        params["status"] = status.strip()
    if start_date and end_date:
        query += " AND TO_CHAR(b.TRANSACTION_DATE, 'YYYY-MM-DD') BETWEEN :start_date AND :end_date"
        params["start_date"] = start_date.strip()
        params["end_date"] = end_date.strip()

    query += " ORDER BY b.TRANSACTION_DATE DESC"

    cursor.execute(query, params)
    rows = cursor.fetchall()
    columns = [col[0].lower() for col in cursor.description]
    return [dict(zip(columns, row)) for row in rows]


# ✅ ฟังก์ชันค้นหาใบเสร็จรับเงิน Member
def search_member_receipt(plate1, plate2, province, invoice_no, start_date, end_date):
    conn = get_connection()
    cursor = conn.cursor()

    query = """
        SELECT a.RECEIPT_FILE_ID, b.TRANSACTION_DATE, a.INVOICE_NO, a.INVOICE_NO_REF,
               a.STATUS, a.INVOICE_TYPE, a.FEE_AMOUNT, a.COLLECTION_AMOUNT, 
               a.DISCOUNT, a.TOTAL_AMOUNT
        FROM INVOICE_SERVICE.MF_INVOICE a
        LEFT JOIN INVOICE_SERVICE.MF_INVOICE_DETAIL b ON a.INVOICE_NO = b.INVOICE_NO
        WHERE a.DELETE_FLAG = 0
            AND a.FEE_AMOUNT > 0
            AND a.INVOICE_TYPE != '3'
            AND a.STATUS = 'PAYMENT_SUCCESS'
    """
    params = {}
    if plate1:
        query += " AND a.PLATE1 = :plate1"
        params["plate1"] = plate1.strip()
    if plate2:
        query += " AND a.PLATE2 = :plate2"
        params["plate2"] = plate2.strip()
    if province:
        query += " AND a.PROVINCE = :province"
        params["province"] = province.strip()
    if invoice_no:
        query += " AND a.INVOICE_NO = :invoice_no"
        params["invoice_no"] = invoice_no.strip()
    if start_date and end_date:
        query += " AND TO_CHAR(b.TRANSACTION_DATE, 'YYYY-MM-DD') BETWEEN :start_date AND :end_date"
        params["start_date"] = start_date.strip()
        params["end_date"] = end_date.strip()

    query += " ORDER BY b.TRANSACTION_DATE DESC"

    cursor.execute(query, params)
    rows = cursor.fetchall()
    columns = [col[0].lower() for col in cursor.description]
    return [dict(zip(columns, row)) for row in rows]

# ✅ ฟังก์ชันค้นหาใบเสร็จรับเงิน NonMember
def search_nonmember_receipt(plate1, plate2, province, invoice_no, start_date, end_date):
    conn = get_connection()
    cursor = conn.cursor()

    query = """
        SELECT a.RECEIPT_FILE_ID, b.TRANSACTION_DATE, a.INVOICE_NO, a.INVOICE_NO_REF,
               a.STATUS, a.INVOICE_TYPE, a.FEE_AMOUNT, a.COLLECTION_AMOUNT, 
               a.DISCOUNT, a.TOTAL_AMOUNT
        FROM INVOICE_SERVICE.MF_INVOICE_NONMEMBER a
        LEFT JOIN INVOICE_SERVICE.MF_INVOICE_DETAIL_NONMEMBER b ON a.INVOICE_NO = b.INVOICE_NO
        WHERE a.DELETE_FLAG = 0
            AND a.FEE_AMOUNT > 0
            AND a.INVOICE_TYPE != '3'
            AND a.STATUS = 'PAYMENT_SUCCESS'
    """
    params = {}
    if plate1:
        query += " AND a.PLATE1 = :plate1"
        params["plate1"] = plate1.strip()
    if plate2:
        query += " AND a.PLATE2 = :plate2"
        params["plate2"] = plate2.strip()
    if province:
        query += " AND a.PROVINCE = :province"
        params["province"] = province.strip()
    if invoice_no:
        query += " AND a.INVOICE_NO = :invoice_no"
        params["invoice_no"] = invoice_no.strip()
    if start_date and end_date:
        query += " AND TO_CHAR(b.TRANSACTION_DATE, 'YYYY-MM-DD') BETWEEN :start_date AND :end_date"
        params["start_date"] = start_date.strip()
        params["end_date"] = end_date.strip()

    query += " ORDER BY b.TRANSACTION_DATE DESC"

    cursor.execute(query, params)
    rows = cursor.fetchall()
    columns = [col[0].lower() for col in cursor.description]
    return [dict(zip(columns, row)) for row in rows]

# ✅ ฟังก์ชันตรวจสอบรายการผ่านทาง Member
def get_tran_member(start_date, end_date, plate1, plate2, province, status, plaza):
    conn = get_connection()
    cursor = conn.cursor()

    base_query = """
        SELECT TA.REF_TRANSACTION_ID, B.TRANSACTION_ID, 
            TO_CHAR(ADD_MONTHS(B.TRANSACTION_DATE, 543 * 12), 'DD/MM/YYYY') AS TranDate,
            TO_CHAR(B.TRANSACTION_DATE, 'HH24:MI:SS') AS TranTime,
            A.PLATE1 || ' ' || B.PLATE2 AS Licesne, 
            V.DESCRIPTION AS Province, W.DESCRIPTION AS WheelType,
            B.TOTAL_AMOUNT, H.NAME AS HQ, P.NAME AS Plaza, L.NAME AS Lane,
            A.STATUS, CA.BODY_PATH_PIC, CA.PLATE_PATH_PIC
        FROM INVOICE_SERVICE.MF_INVOICE A  
        INNER JOIN INVOICE_SERVICE.MF_INVOICE_DETAIL B ON A.INVOICE_NO = B.INVOICE_NO 
        LEFT JOIN CUSTOMER_SERVICE.MF_CUST_MASTER_HQ H ON B.HQ_CODE = H.CODE  
        LEFT JOIN CUSTOMER_SERVICE.MF_CUST_MASTER_PLAZA P ON B.PLAZA_CODE = P.CODE
        LEFT JOIN CUSTOMER_SERVICE.MF_CUST_MASTER_LANE L ON B.LANE_CODE = L.CODE 
        LEFT JOIN CUSTOMER_SERVICE.MF_CUST_MASTER_VEHICLE_OFFICE V ON A.PROVINCE = V.CODE 
        LEFT JOIN CUSTOMER_SERVICE.MF_CUST_MASTER_FEE_WHEEL W ON B.VEHICLE_WHEEL = W.CODE
        LEFT JOIN CUSTOMER_SERVICE.MF_CUST_MEMBER_TRANS_CAMERA CA ON B.TRANSACTION_ID = CA.TRANSACTION_ID
        LEFT JOIN CUSTOMER_SERVICE.MF_CUST_MEMBER_TRANSACTION TA ON B.TRANSACTION_ID = TA.TRANSACTION_ID
        WHERE A.DELETE_FLAG = 0 
          AND A.INVOICE_TYPE != 3 
          AND A.TOTAL_AMOUNT != 0
          AND A.PLATE1 = :plate1 
          AND A.PLATE2 = :plate2 
          AND A.PROVINCE = :province 
          AND TO_CHAR(B.TRANSACTION_DATE, 'YYYY-MM-DD') BETWEEN :start_date AND :end_date
    """

    params = {
        "plate1": plate1,
        "plate2": plate2,
        "province": province,
        "start_date": start_date,
        "end_date": end_date,
    }

    if status:
        base_query += " AND A.STATUS = :status"
        params["status"] = status

    if plaza:
        base_query += " AND B.PLAZA_CODE = :plaza"
        params["plaza"] = plaza

    base_query += " ORDER BY B.TRANSACTION_DATE DESC"

    cursor.execute(base_query, params)
    columns = [col[0].lower() for col in cursor.description]
    rows = cursor.fetchall()
    results = [dict(zip(columns, row)) for row in rows]

    cursor.close()
    conn.close()
    return results

# ✅ ฟังก์ชันตรวจสอบรายการผ่านทาง Nonmember
def get_tran_nonmember(start_date, end_date, plate1, plate2, province, status, plaza):
    conn = get_connection()
    cursor = conn.cursor()

    base_query = """
        SELECT TA.REF_TRANSACTION_ID, B.TRANSACTION_ID, 
            TO_CHAR(ADD_MONTHS(B.TRANSACTION_DATE, 543 * 12), 'DD/MM/YYYY') AS TranDate,
            TO_CHAR(B.TRANSACTION_DATE, 'HH24:MI:SS') AS TranTime,
            A.PLATE1 || ' ' || B.PLATE2 AS Licesne, 
            V.DESCRIPTION AS Province, W.DESCRIPTION AS WheelType,
            B.TOTAL_AMOUNT, H.NAME AS HQ, P.NAME AS Plaza, L.NAME AS Lane,
            A.STATUS, CA.BODY_PATH_PIC, CA.PLATE_PATH_PIC
        FROM INVOICE_SERVICE.MF_INVOICE_NONMEMBER A  
        INNER JOIN INVOICE_SERVICE.MF_INVOICE_DETAIL_NONMEMBER B ON A.INVOICE_NO = B.INVOICE_NO 
        LEFT JOIN CUSTOMER_SERVICE.MF_CUST_MASTER_HQ H ON B.HQ_CODE = H.CODE  
        LEFT JOIN CUSTOMER_SERVICE.MF_CUST_MASTER_PLAZA P ON B.PLAZA_CODE = P.CODE
        LEFT JOIN CUSTOMER_SERVICE.MF_CUST_MASTER_LANE L ON B.LANE_CODE = L.CODE 
        LEFT JOIN CUSTOMER_SERVICE.MF_CUST_MASTER_VEHICLE_OFFICE V ON A.PROVINCE = V.CODE 
        LEFT JOIN CUSTOMER_SERVICE.MF_CUST_MASTER_FEE_WHEEL W ON B.VEHICLE_WHEEL = W.CODE
        LEFT JOIN NONMEMBER_SERVICE.MF_NONM_TRANS_CAMERA CA ON B.TRANSACTION_ID = CA.TRANSACTION_ID
        LEFT JOIN NONMEMBER_SERVICE.MF_NONM_TRANSACTION TA ON B.TRANSACTION_ID = TA.TRANSACTION_ID
        WHERE A.DELETE_FLAG = 0 
          AND A.INVOICE_TYPE != 3 
          AND A.TOTAL_AMOUNT != 0
          AND A.PLATE1 = :plate1 
          AND A.PLATE2 = :plate2 
          AND A.PROVINCE = :province 
          AND TO_CHAR(B.TRANSACTION_DATE, 'YYYY-MM-DD') BETWEEN :start_date AND :end_date
    """

    params = {
        "plate1": plate1,
        "plate2": plate2,
        "province": province,
        "start_date": start_date,
        "end_date": end_date,
    }

    if status:
        base_query += " AND A.STATUS = :status"
        params["status"] = status

    if plaza:
        base_query += " AND B.PLAZA_CODE = :plaza"
        params["plaza"] = plaza

    base_query += " ORDER BY B.TRANSACTION_DATE DESC"

    cursor.execute(base_query, params)
    columns = [col[0].lower() for col in cursor.description]
    rows = cursor.fetchall()
    results = [dict(zip(columns, row)) for row in rows]

    cursor.close()
    conn.close()
    return results

# ✅ ฟังก์ชันตรวจสอบรายการผ่านทาง illegal
def get_tran_illegal(start_date, end_date, plate1, plate2, province, plaza):
    conn = get_connection()
    cursor = conn.cursor()

    base_query = """
        SELECT A.TRANSACTION_ID, TO_CHAR(ADD_MONTHS(A.TRANSACTION_DATE, 543 * 12), 'DD/MM/YYYY') AS TranDate,
            TO_CHAR(A.TRANSACTION_DATE, 'HH24:MI:SS') AS TranTime,
            A.VEHICLE_LICENSE_1 || ' ' || A.VEHICLE_LICENSE_2 AS Licesne, B.DESCRIPTION AS Province, C.DESCRIPTION AS WheelType,
            H.NAME AS HQ, P.NAME AS Plaza, L.NAME AS Lane, CA.BODY_PATH_PIC, CA.PLATE_PATH_PIC
        FROM VERIFY_ILLEGAL_SERVICE.MF_VEILL_ILLEGAL_TRANSACTION A
        LEFT JOIN VERIFY_ILLEGAL_SERVICE.MF_VEILL_MASTER_VHC_OFFICE B ON B.CODE = A.VEHICLE_PROVINCE
        LEFT JOIN VERIFY_ILLEGAL_SERVICE.MF_VEILL_MAS_FEE_WHEEL C ON C.CODE = A.VEHICLE_WHEEL_CODE
        LEFT JOIN VERIFY_ILLEGAL_SERVICE.MF_VEILL_MASTER_HQ H ON H.CODE = A.HQ_CODE
        LEFT JOIN VERIFY_ILLEGAL_SERVICE.MF_VEILL_MASTER_PLAZA P ON P.CODE = A.PLAZA_CODE
        LEFT JOIN VERIFY_ILLEGAL_SERVICE.MF_VEILL_MASTER_LANE L ON L.CODE = A.LANE_CODE
        LEFT JOIN VERIFY_ILLEGAL_SERVICE.MF_VEILL_ILLEGAL_TRANS_CAMERA CA ON A.TRANSACTION_ID = CA.TRANSACTION_ID
        WHERE A.DELETE_FLAG = 0 
          AND A.VEHICLE_LICENSE_1 = :plate1 
          AND A.VEHICLE_LICENSE_2 = :plate2 
          AND A.VEHICLE_PROVINCE = :province 
          AND TO_CHAR(A.TRANSACTION_DATE, 'YYYY-MM-DD') BETWEEN :start_date AND :end_date
    """

    params = {
        "plate1": plate1,
        "plate2": plate2,
        "province": province,
        "start_date": start_date,
        "end_date": end_date,
    }

    if plaza:
        base_query += " AND A.PLAZA_CODE = :plaza"
        params["plaza"] = plaza

    base_query += " ORDER BY A.TRANSACTION_DATE DESC"

    cursor.execute(base_query, params)
    columns = [col[0].lower() for col in cursor.description]
    rows = cursor.fetchall()
    results = [dict(zip(columns, row)) for row in rows]

    cursor.close()
    conn.close()
    return results

# ✅ ฟังก์ชัน Transection Detail
def fetch_tran_details(ids: List[str], id_type: str):
    conn = get_connection()
    cursor = conn.cursor()

    results = []
    batch_size = 1000
    for i in range(0, len(ids), batch_size):
        batch_ids = ids[i:i+batch_size]
        placeholders = ','.join([f':{j+1}' for j in range(len(batch_ids))])
        
        sql = f"""
        WITH combined_invoices AS (
        SELECT 
            mi2.REF_TRANSACTION_ID,
            mi1.TRANSACTION_ID,       
            TO_CHAR(ADD_MONTHS(mi.PAYMENT_DATE, 543 * 12), 'MM/YYYY') AS "วันที่รับชำระเงิน",TO_CHAR(ADD_MONTHS(mi.PAYMENT_DATE, 543 * 12), 'DD/MM/YYYY') AS "วันที่รับชำระเงิน1",TO_CHAR(mi.PAYMENT_DATE, 'HH24:MI:SS') AS "เวลาที่ชำระ",
            mi.PLATE1 || ' ' || mi.PLATE2 AS "ป้ายทะเบียน",
            V.DESCRIPTION AS "จังหวัด",  
            TO_CHAR(ADD_MONTHS(mi1.TRANSACTION_DATE, 543 * 12), 'DD/MM/YYYY') AS "วันเวลาผ่านทาง",   
            TO_CHAR(mi1.TRANSACTION_DATE, 'HH24:MI:SS') AS "เวลาผ่านทาง",       
            mi1.FEE_AMOUNT,   
            CASE 
                WHEN mi.INVOICE_NO_REF IS NOT NULL THEN 0
                ELSE 0
            END AS "รายการค่าปรับ x2",
            CASE 
                WHEN mi.INVOICE_NO_REF IS NOT NULL THEN mi.FEE_AMOUNT * 10
                ELSE 0
            END AS "รายการค่าปรับ x10",mi.TOTAL_AMOUNT , mi.STATUS,  
            'NONMEMBER' AS "สถานะสมาชิก",     
            CASE 
                WHEN mi2.VEHICLE_WHEEL_CODE = 'VWHEL0001' THEN 'C1'
                WHEN mi2.VEHICLE_WHEEL_CODE = 'VWHEL0002' THEN 'C2'
                WHEN mi2.VEHICLE_WHEEL_CODE = 'VWHEL0003' THEN 'C3'
                ELSE mi2.VEHICLE_WHEEL_CODE
            END AS "ประเภทรถ",   
            P.NAME AS "ด่าน",     
            mi.DISCOUNT, 
            mi.PAYMENT_CHANNEL AS "ช่องทางชำระ" ,'NONMEMBERBILLTIME' AS "รูปแบบการชำระ" 
        FROM INVOICE_SERVICE.MF_INVOICE_NONMEMBER mi
        LEFT JOIN INVOICE_SERVICE.MF_INVOICE_DETAIL_NONMEMBER mi1 ON mi.INVOICE_NO = mi1.INVOICE_NO
        LEFT JOIN NONMEMBER_SERVICE.MF_NONM_TRANSACTION mi2 ON mi1.TRANSACTION_ID = mi2.TRANSACTION_ID
        LEFT JOIN CUSTOMER_SERVICE.MF_CUST_MASTER_VEHICLE_OFFICE V ON mi.PROVINCE = V.CODE
        LEFT JOIN CUSTOMER_SERVICE.MF_CUST_MASTER_PLAZA P ON mi1.PLAZA_CODE = P.CODE 
        WHERE mi.INVOICE_TYPE IN (0,1,2) AND mi.CREATE_CHANNEL != 'Dispute Service'
        UNION ALL
        SELECT 
            mi2.REF_TRANSACTION_ID,
            mi1.TRANSACTION_ID,        
            TO_CHAR(ADD_MONTHS(mi.PAYMENT_DATE, 543 * 12), 'MM/YYYY') AS "วันที่รับชำระเงิน",TO_CHAR(ADD_MONTHS(mi.PAYMENT_DATE, 543 * 12), 'DD/MM/YYYY') AS "วันที่รับชำระเงิน1",TO_CHAR(mi.PAYMENT_DATE, 'HH24:MI:SS') AS "เวลาที่ชำระ",
            mi.PLATE1 || ' ' || mi.PLATE2 AS "ป้ายทะเบียน",
            V.DESCRIPTION AS "จังหวัด",  
            TO_CHAR(ADD_MONTHS(mi1.TRANSACTION_DATE, 543 * 12), 'DD/MM/YYYY') AS "วันเวลาผ่านทาง",   
            TO_CHAR(mi1.TRANSACTION_DATE, 'HH24:MI:SS') AS "เวลาผ่านทาง",       
            mi1.FEE_AMOUNT,   
            CASE 
                WHEN mi.INVOICE_NO_REF IS NOT NULL THEN mi.FEE_AMOUNT * 2
                ELSE 0
            END AS "รายการค่าปรับ x2",
            CASE 
                WHEN mi.INVOICE_NO_REF IS NOT NULL THEN 0
                ELSE 0
            END AS "รายการค่าปรับ x10", mi.TOTAL_AMOUNT ,mi.STATUS,
            'MEMBER' AS MEMBER_TYPE,    
            CASE 
                WHEN mi2.VEHICLE_WHEEL_CODE = 'VWHEL0001' THEN 'C1'
                WHEN mi2.VEHICLE_WHEEL_CODE = 'VWHEL0002' THEN 'C2'
                WHEN mi2.VEHICLE_WHEEL_CODE = 'VWHEL0003' THEN 'C3'
                ELSE mi2.VEHICLE_WHEEL_CODE
            END AS "ประเภทรถ",   
            P.NAME AS "ด่าน",     
            mi.DISCOUNT, 
            mi.PAYMENT_CHANNEL AS "ช่องทางชำระ",mi.INVOICE_CHANNEL  AS "รูปแบบการชำระ" 
        FROM INVOICE_SERVICE.MF_INVOICE mi
        LEFT JOIN INVOICE_SERVICE.MF_INVOICE_DETAIL mi1 ON mi.INVOICE_NO = mi1.INVOICE_NO
        LEFT JOIN CUSTOMER_SERVICE.MF_CUST_MEMBER_TRANSACTION mi2 ON mi1.TRANSACTION_ID = mi2.TRANSACTION_ID
        LEFT JOIN CUSTOMER_SERVICE.MF_CUST_MASTER_VEHICLE_OFFICE V ON mi.PROVINCE = V.CODE
        LEFT JOIN CUSTOMER_SERVICE.MF_CUST_MASTER_PLAZA P ON mi1.PLAZA_CODE = P.CODE
        WHERE mi.INVOICE_TYPE IN (0,1,2) AND mi.CREATE_CHANNEL != 'Dispute Service'
        )
        SELECT DISTINCT * FROM combined_invoices
        WHERE {id_type} IN ({placeholders})
        """
        try:
            cursor.execute(sql, batch_ids)
            rows = cursor.fetchall()
            cols = [desc[0] for desc in cursor.description]
            batch_result = [dict(zip(cols, row)) for row in rows]
            results.extend(batch_result)
        except Exception as e:
            print(f"❌ Batch failed at index {i}: {e}")

    return results

# ✅ ฟังก์ชันตรวจสอบข้อมูลรถ
def search_car(plate1, plate2, province):
    conn = get_connection()
    cursor = conn.cursor()

    query = """
        SELECT * FROM CUSTOMER_SERVICE.MF_CUST_VEHICLE_INFO a 
            WHERE
    """
    params = {}
    if plate1:
        query += " a.PLATE1 = :plate1"
        params["plate1"] = plate1.strip()
    if plate2:
        query += " AND a.PLATE2 = :plate2"
        params["plate2"] = plate2.strip()
    if province:
        query += " AND a.PROVINCE = :province"
        params["province"] = province.strip()

    query += " ORDER BY a.CREATE_DATE DESC"

    cursor.execute(query, params)
    rows = cursor.fetchall()
    columns = [col[0].lower() for col in cursor.description]

    return [dict(zip(columns, row)) for row in rows]

# ✅ ฟังก์ชันตรวจสอบข้อมูลรูปภาพลงทะเบียนสมาชิก
def search_images_register(car_id, customer_id):
    conn = get_connection()
    cursor = conn.cursor()

    # รูปภาพรถ
    query_img_car = """
        SELECT FILE_ID ,TYPE ,FILE_TYPE FROM CUSTOMER_SERVICE.MF_CUST_VEHICLE_INFO_FILE WHERE DELETE_FLAG ='0' 
    """
    params_img_car = {}
    if car_id:
        query_img_car += " AND VEHICLE_INFO_ID = :car_id"
        params_img_car["car_id"] = str(car_id).strip()
    cursor.execute(query_img_car, params_img_car) 
    rows_img_car = cursor.fetchall()
    columns_img_car = [col[0].lower() for col in cursor.description]


    # ข้อมูล ผชท
    query_customer = """
        SELECT * FROM CUSTOMER_SERVICE.MF_CUST_INFO mci WHERE CUSTOMER_ID = :customer_id
    """
    params_customer = {}
    if customer_id:
        params_customer["customer_id"] = customer_id.strip()
    query_customer += " ORDER BY CREATE_DATE DESC"    
    cursor.execute(query_customer, params_customer)  
    rows_customer = cursor.fetchone()
    id_customer = rows_customer[0]
    
    # รูปภาพ ผชท 
    query_img_customer = """
        SELECT FILE_ID ,TYPE ,FILE_TYPE FROM CUSTOMER_SERVICE.MF_CUST_INFO_IMAGES WHERE DELETE_FLAG ='0' 
    """
    params_img_customer = {}
    if id_customer:
        query_img_customer += " AND CUSTOMER_INFO_ID = :id_customer"
        params_img_customer["id_customer"] = str(id_customer).strip()

    cursor.execute(query_img_customer, params_img_customer) 
    rows_img_customer = cursor.fetchall()
    columns_img_customer = [col[0].lower() for col in cursor.description]

    result_img_customer = [dict(zip(columns_img_customer, row)) for row in rows_img_customer]
    result_img_car = [dict(zip(columns_img_car, row)) for row in rows_img_car]

    return result_img_customer + result_img_car
