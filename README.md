## FlexDBConnector

FlexDBConnector is an API designed to facilitate interactions with MongoDB and MySQL databases. Offering a flexible approach, it empowers users to effortlessly manage essential CRUD operations, including data insertion, deletion, and modification. You just need to set up the parameters to connect to the database, and the API will assist you in interacting with all the collections available in that database.

<hr>

API Documentation : <a href="https://apidocumentation-mongo-mysql.netlify.app/"> Documentation </a>

<hr> 

<h3> Installation </h3>

```bash
git clone https://github.com/ttruongg/FlexDBConnector.git

```
<br>
### Navigate to the project directory

```bash
cd FlexDBConnector

```

### install dependencies
```bash
npm install

```

Before starting, please navigate to the <b>config.properties</b> file to select the type of database and customize necessary parameters to support connection, such as host, database name, user, password, etc.

![screen](https://github.com/ttruongg/FlexDBConnector/assets/106587727/982ad278-04e3-4469-bd25-9b68a5ad1d66)




<hr>
These are APIs that Node.js Express will export:

| Methods |  URLs  | Action |
|:-----|:--------:|------:|
| GET   | api/data | Query all documents/records of a table |
| POST   | api/data/insert | Add document/record to database |
| POST   | api/data/find | Execute custom queries |
| POST   | api/data/delete | Delete document/record |
| POST   | api/data/update | Update document/record |
| POST   | api/data/aggregate | allow you to group, sort, perform calculations, analyze data, and much more |


<br>

<hr>

Test API with Insomnia or Postman, it's up to you.

<b> For example: </b>

Find users with an age greater than or equal to 30.

![screen](https://github.com/ttruongg/FlexDBConnector/assets/106587727/13b266f1-9f66-4765-a22f-e10c99523a89)


Update email and work_exp of user 

![image](https://github.com/ttruongg/FlexDBConnector/assets/106587727/d35002c7-c93a-4aa7-b180-03f3edafeebe)

Change the value of collection, _id, and value to update according to your database. <br>
Example: <br>

```bash
{
    "collection": "your_collection",   
    "_id": "if_of_document_need_to_be_updated",
    "values": 
        {
	// new value 
        }
}
```

Aggregation $lookup 

![image](https://github.com/ttruongg/FlexDBConnector/assets/106587727/ddc2bffb-9d92-4d22-9c29-7a4492b5a49f)



