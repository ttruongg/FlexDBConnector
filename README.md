## FlexDBConnector

FlexDBConnector is an API designed to facilitate interactions with MongoDB and MySQL databases. Offering a flexible approach, it empowers users to effortlessly manage essential CRUD operations, including data insertion, deletion, and modification.

<hr>

Before starting, please navigate to the <b>config.properties</b> file to select the type of database and customize necessary parameters to support connection, such as host, database name, user, password, etc.

![screen](https://github.com/ttruongg/FlexDBConnector/assets/106587727/982ad278-04e3-4469-bd25-9b68a5ad1d66)

Next step

```bash
npm i express mongoose mysql

```

<hr>
These are APIs that Node.js Express will export:

| Methods |  URLs  | Action |
|:-----|:--------:|------:|
| GET   | api/user/data/mongo | get all Users |
| POST   | api/user/data/mongo/insert | Add one or more users |
| POST   | api/user/data/mongo/find | find by condition |
| POST   | api/user/data/mongo/delete | delete user with specific id or condition|
| PUT   | api/user/data/mongo/:id | update user by id |


In the case of MySQL, change to mongo URLs to mysql.
<br>
Example: api/user/data/<b>mongo</b> to api/user/data/<b>mysql</b>

<hr>

Test API with Insomnia or Postman, it's up to you.

For example: Find users with an age greater than or equal to 30.

![screen](https://github.com/ttruongg/FlexDBConnector/assets/106587727/13b266f1-9f66-4765-a22f-e10c99523a89)



