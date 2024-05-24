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
<h3> Navigate to the project directory </h3> 

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


<hr>

Your feedback and contributions are welcome!
