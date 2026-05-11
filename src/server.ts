import { Database } from "bun:sqlite";
const db = new Database("mydb.sqlite", { create: true, strict: true });

let apiKey = 0
while (apiKey === 0) {
    apiKey = Math.random()
}

// make(db); insert(db);
// show(db);
serve(db);

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
    console.log(db.query("SELECT * FROM daten").all())
    console.log(db.query("SELECT * FROM user").all())
}
function insert(db: Database) {
    try {
        const insertData = db.prepare("INSERT INTO daten (name, data) VALUES ($name, $data)");
        insertData.run({ name: "Max Mustermann", data: "123abc" });
        insertData.run({ name: "Hans Wurst", data: "29fu3h" });
        insertData.run({ name: "Susi Sorglos", data: "c34tcx43t" });

        const insertUser = db.prepare("INSERT INTO user (name, password) VALUES ($name, $password)");
        insertUser.run({ name: "Swen", password: "12345" });
    } catch (fehler) {
        console.log(fehler);
    }
}
interface Daten {
    name: string
    data: string
    key: string
}
interface User {
    name: string
    password: string
}
interface Anzahl {
    anzahl: number
}
interface Password {
    password: string
}
function serve(db: Database) {
    const server = Bun.serve({
        async fetch(req) {
            const path = new URL(req.url).pathname;
            // console.log("Path: " + path);
            // respond with text/html
            if (path === "/") return new Response(Bun.file(".\\index.html"));

            

            // redirect
            //if (path === "/redir") return Response.redirect("/source", 301);

            if (path.substring(0, 8) === "/api/v1/") {
                const pfad = path.substring(8).toLowerCase();
                const method = req.method.toLowerCase();
                if (pfad === "login" && method === "post") {
                    const json = await req.json() as User;
                    const name = json.name, password = json.password
                    const result = db.query("SELECT password FROM user WHERE name = $name").get({ name: name }) as Password;
                    if (result.password === password) {
                        return Response.json({ key: apiKey })
                    }
                    return Response.json("Fehler", { status: 400 })
                }
                if (pfad.substring(0, 3) === "get") {
                    const key = parseFloat(new URL(req.url).searchParams.get("key") as string)
                    if (key === apiKey) {
                        const result = db.query("SELECT * FROM daten").all()
                        return Response.json(result);
                    }
                    return Response.json("Fehler", { status: 403 })
                }
                if (pfad.substring(0, 6) === "anzahl") {
                    const key = parseFloat(new URL(req.url).searchParams.get("key") as string)
                    if (key === apiKey) {
                        const result = db.query("SELECT COUNT(*) AS anzahl FROM daten").get() as Anzahl;
                        const anzahl = result["anzahl"];
                        return Response.json(anzahl);
                    }
                     return Response.json("Fehler", { status: 403 })
                }                                    
                if (pfad === "post" && method === "post") {
                    const json = await req.json() as Daten;
                    if (json.name !== "" && json.data !== "" && parseFloat(json.key) === apiKey) {
                        const sql = "INSERT INTO daten (name, data) VALUES ($name, $data)";
                        const data = { name: json.name, data: json.data };
                        try {
                            const insertData = db.prepare(sql);
                            insertData.run(data);
                            return Response.json("Ok", { status: 201 });
                        } catch (fehler) {
                            console.log(fehler);
                            return Response.json("Fehler", { status: 400 });
                        }
                    }
                    return Response.json("Fehler", { status: 403 });
                }
            }

            // 404s
            return Response.json("Nicht gefunden", { status: 404 });
        },
        port: 3000,
        // hostname: "172.20.10.2"
    });

    console.log(`Server auf Port ${server.url}`);
}
