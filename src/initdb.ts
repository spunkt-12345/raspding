import { Database } from "bun:sqlite";
const db = new Database("mydb.sqlite", { create: true, strict: true });

function make(db: Database) {
    const sql = `
    CREATE TABLE IF NOT EXISTS daten (
        id  INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        data TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS user (
        id  INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        password TEXT NOT NULL
    )`;
    try {
        db.run(sql);
    } catch (fehler) {
        console.log(fehler);
    }
}
function show(db: Database) {
    // console.log(db.query("SELECT * FROM daten").all())
    console.log(db.query("SELECT * FROM user").all())
}
async function insert(db: Database) {
    try {
        const insertData = db.prepare("INSERT INTO daten (name, data) VALUES ($name, $data)");
        insertData.run({ name: "Laptop XIIe", data: "123abc" });
        insertData.run({ name: "Smartphone G1234", data: "29fu3h" });
        insertData.run({ name: "Dokken Station G1+", data: "c34tcx43t" });

        const insertUser = db.prepare("INSERT INTO user (name, password) VALUES ($name, $password)");
        const admin = { name: "Felix", password: "12345" }
        admin.password = await Bun.password.hash(admin.password)
        insertUser.run(admin);
    } catch (fehler) {
        console.log(fehler);
    }
}

// make(db);
// insert(db);
// show(db);