-- Fetching order history for customers
SELECT O.OrderNo AS Order_No, O.OrderTime As Order_Time, O.isPaid AS isCompleted, R.Rest_Name AS Restaurant, U.FirstName AS Delivery, SUM(OC.Quantity) AS Quantity, (SUM(OC.Quantity*FI.Price) + O.Del_Charge) AS Price
FROM ORDERS O, ORDER_CONTENTS OC, FOOD_ITEMS FI, RESTAURANTS R, USERS U
WHERE
	O.Cust_Uname = 'RubanS' AND 
	O.FSSAI = R.FSSAI AND
	O.Del_Uname = U.Uname AND 
	OC.OrderNo = O.OrderNo AND 
	FI.ItemNo = OC.ItemNo AND 
	FI.FSSAI = O.FSSAI 
GROUP BY ( Order_No, Order_Time, isCompleted, Restaurant, Delivery)
ORDER BY Order_Time DESC;

-- SELECT OrderNo AS Order_No, OrderTime As Order_Time, Rest_Name AS Restaurant, FirstName AS Delivery, SUM(Quantity) AS Quantity, (SUM(Quantity*Price) + Del_Charge) AS Price
-- FROM ((((SELECT * FROM ORDERS WHERE Cust_Uname = {uname} AND isPaid = {true}) AS CUSTOMER 
-- 		NATURAL JOIN ORDER_CONTENTS) 
-- 		NATURAL JOIN FOOD_ITEMS) 
-- 		NATURAL JOIN RESTAURANTS) 
-- 		JOIN USERS ON Del_Uname = Uname 
-- GROUP BY ( Order_No, Order_Time, Restaurant, Delivery, Del_Charge)
-- ORDER BY Order_Time DESC;

-- SELECT OrderNo, OrderTime, isPlaced, isAssigned, isPaid, Cust_name, Rest_name, Del_name, SUM(Quantity) AS Quantity, (SUM(Quantity*Price)) AS Price, Del_Charge
-- FROM (((((SELECT OrderNo, OrderTime, isPlaced, isAssigned, isPaid, Cust_Uname, FSSAI, Del_Uname, Del_Charge FROM ORDERS WHERE {wherecomp} = {uname}) AS O
-- 	LEFT OUTER JOIN (SELECT Cust_Uname, FirstName AS Cust_name FROM CUSTOMERS) AS C)
-- 	NATURAL JOIN (SELECT FSSAI, Rest_name FROM RESTAURANTS) AS R)
-- 	NATURAL JOIN (SELECT Del_Uname, Firstname as Del_name FROM DELIVERY_PERSONS) AS D)
-- 	NATURAL JOIN (SELECT Quantity FROM ORDER_CONTENTS) AS OC)
-- 	NATURAL JOIN (SELECT Price FROM FOOD_ITEMS) AS FI
-- GROUP BY (OrderNo, OrderTime, isPlaced, isAssigned, isPaid, Cust_name, Rest_name, Del_name, Del_Charge)
-- ORDER BY OrderTime DESC;

-- Final fetch
SELECT OrderNo, OrderTime, isAssigned, isPaid, Cust_name, Rest_name, Del_name, SUM(Quantity) AS Quantity, (SUM(Quantity*Price)) AS Price, Del_Charge
FROM (((((SELECT OrderNo, OrderTime, isAssigned, isPaid, Cust_Uname, FSSAI, Del_Uname, Del_Charge FROM ORDERS WHERE {condition} AND isPlaced = true) AS O
NATURAL JOIN (SELECT Uname AS Cust_Uname, Firstname AS Cust_name FROM USERS) AS C)
NATURAL JOIN (SELECT FSSAI, Rest_Name FROM RESTAURANTS) AS R)
LEFT OUTER JOIN (SELECT Uname, FirstName AS Del_name FROM USERS) AS D ON Del_Uname = Uname)
NATURAL JOIN (SELECT OrderNo, ItemNo, Quantity FROM ORDER_CONTENTS) AS OC)
NATURAL JOIN (SELECT ItemNo, FSSAI, Price FROM FOOD_ITEMS) AS FI
GROUP BY (OrderNo, OrderTime, isAssigned, isPaid, Cust_name, Rest_name, Del_name, Del_Charge)
ORDER BY OrderTime DESC;

-- Fetching order history for restaurants
-- SELECT O.OrderNo AS Order_No, O.OrderTime AS Order_Time, O.isPaid  AS isCompleted, U1.FirstName AS Customer, U2.FirstName AS Delivery, SUM(OC.Quantity) AS Quantity, (SUM(OC.Quantity*FI.Price) + O.Del_Charge) AS Price 
-- FROM ORDERS O, ORDER_CONTENTS OC, FOOD_ITEMS FI, RESTAURANTS R, USERS U1, USERS U2
-- WHERE
-- 	R.Rest_Uname = 'Sankys' AND 
-- 	O.FSSAI = R.FSSAI AND 
-- 	O.Cust_Uname = U1.Uname AND 
-- 	O.Del_Uname = U2.Uname AND 
-- 	OC.OrderNo = O.OrderNo AND 
-- 	FI.ItemNo = OC.ItemNo AND 
-- 	FI.FSSAI = O.FSSAI 
-- GROUP BY ( Order_No, Order_Time, isCompleted, Customer, Delivery)
-- ORDER BY Order_Time DESC;

SELECT OrderNo AS Order_No, OrderTime AS Order_Time, Cust_FirstName AS Customer, Del_FirstName AS Delivery, SUM(Quantity) AS Quantity, (SUM(Quantity*Price) + Del_Charge) AS Price 
FROM (((SELECT * FROM ORDERS WHERE FSSAI = {fssai} AND isPaid = {true}) AS RESTAURANT 
		NATURAL JOIN ORDER_CONTENTS) 
		NATURAL JOIN FOOD_ITEMS) 
		NATURAL JOIN (SELECT Uname AS Cust_Uname, FirstName AS Cust_FirstName FROM USERS) AS CUSTOMER_NAMES 
		NATURAL JOIN (SELECT Uname AS Del_Uname, FirstName AS Del_FirstName FROM USERS) AS DELIVERY_NAMES
GROUP BY ( Order_No, Order_Time, Customer, Delivery, Del_Charge)
ORDER BY Order_Time DESC;

-- Fetching order history for delivery person
-- SELECT O.OrderNo AS Order_No, O.OrderTime AS Order_Time, O.isPaid  AS isCompleted, U.FirstName AS Customer, R.Rest_Name AS Restaurant, SUM(OC.Quantity) AS Quantity, O.Del_Charge AS Price
-- FROM ORDERS O, ORDER_CONTENTS OC, FOOD_ITEMS FI, RESTAURANTS R, USERS U
-- WHERE
-- 	O.Del_Uname = {uname} AND
-- 	O.Cust_Uname = U.Uname AND 
-- 	O.FSSAI = R.FSSAI AND 
-- 	OC.OrderNo = O.OrderNo AND 
-- 	FI.ItemNo = OC.ItemNo AND 
-- 	FI.FSSAI = O.FSSAI 
-- GROUP BY ( Order_No, Order_Time, isCompleted, Customer, Restaurant)
-- ORDER BY Order_Time DESC;

SELECT OrderNo AS Order_No, OrderTime AS Order_Time, FirstName AS Customer, Rest_Name AS Restaurant, SUM(Quantity) AS Quantity, Del_Charge AS Price
FROM ((((SELECT * FROM ORDERS WHERE Del_Uname = {uname} AND isPaid = {true}) AS DELIVERY_PERSON 
		NATURAL JOIN ORDER_CONTENTS) 
		NATURAL JOIN FOOD_ITEMS) 
		NATURAL JOIN RESTAURANTS) 
		JOIN USERS ON Cust_Uname = Uname
GROUP BY ( Order_No, Order_Time, Customer, Restaurant, Del_Charge)
ORDER BY Order_Time DESC;

--Fetch all details of particular order
SELECT * FROM ORDERS WHERE OrderNo = {order_no} AND isPlaced = {true};
SELECT * FROM USERS, CUSTOMERS WHERE Cust_Uname = {cust_uname} AND Cust_Uname = Uname;
SELECT * FROM RESTAURANTS WHERE FSSAI = {fssai};
SELECT * FROM USERS, DELIVERY_PERSONS WHERE Del_Uname = {del_uname} AND Del_Uname = Uname;
SELECT FI.ItemName, FI.Price, OC.Quantity FROM ORDER_CONTENTS OC, FOOD_ITEMS FI;
WHERE OC.OrderNo = {order_no} AND OC.ItemNo = FI.ItemNo AND OC.FSSAI = FI.FSSAI;

--Fetch the cart
-- SELECT O.OrderNo AS Order_No, R.Rest_Name As Restaurant, FI.ItemName, FI.Price, OC.Quantity 
-- FROM ORDERS O, ORDER_CONTENTS OC, RESTAURANTS R, FOOD_ITEMS FI
-- WHERE
-- 	O.Cust_Uname = {uname} AND 
-- 	O.isPlaced = {false} AND 
-- 	O.OrderNo = OC.OrderNo AND 
-- 	OC.ItemNo = FI.ItemNo AND
-- 	OC.FSSAI = FI.FSSAI AND 
-- 	O.FSSAI = R.FSSAI;

SELECT OrderNo AS Order_No, Rest_Name As Restaurant, ItemName, Price, Quantity 
FROM (((SELECT * FROM ORDERS WHERE Cust_Uname = {uname} AND isPlaced = {false}) AS CART
		NATURAL JOIN ORDER_CONTENTS) 
		NATURAL JOIN FOOD_ITEMS) 
		NATURAL JOIN RESTAURANTS;