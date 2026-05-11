import { Database } from "bun:sqlite";
const db = new Database("mydb.sqlite", { create: true, strict: true });

// make(db); insert(db);
serve(db);

function make(db: Database) {
    const sql = `
    CREATE TABLE IF NOT EXISTS daten (
        id  INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        data TEXT NOT NULL
    )`;
    try {
        db.run(sql);
    } catch (fehler) {
        console.log(fehler);
    }
}

function insert(db: Database) {
    const sql = "INSERT INTO daten (name, data) VALUES ($name, $data)";
    const data = { name: "Max Mustermann", data: "123abc" };
    try {
        const insertData = db.prepare(sql);
        insertData.run({ name: "Max Mustermann", data: "123abc" });
        insertData.run({ name: "Hans Wurst", data: "29fu3h" });
        insertData.run({ name: "Susi Sorglos", data: "c34tcx43t" });
    } catch (fehler) {
        console.log(fehler);
    }
}

interface Daten {
    name: string
    data: string
}
interface Anzahl {
    anzahl: number
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

        // respond with JSON
        if (path.substring(0, 8) === "/api/v1/") {
            const pfad = path.substring(8)
            if (pfad === "get") {
                // console.log("get")
                const result = db.query("SELECT * FROM daten").all()
                return Response.json(result);
            }
            if (pfad === "anzahl") {
                // console.log("anzahl")
                const result = db.query("SELECT COUNT(*) AS anzahl FROM daten").get() as Anzahl;
                const anzahl = result["anzahl"];
                return Response.json(anzahl);
            }                                    
            if (pfad === "post" && req.method === "POST") {
                const json = await req.json() as Daten;
                if (json.name !== "" && json.data !== "") {
                    const sql = "INSERT INTO daten (name, data) VALUES ($name, $data)";
                    const data = { name: json.name, data: json.data };
                    try {
                        const insertData = db.prepare(sql);
                        insertData.run(data);
                        return Response.json("Ok", { status: 201 });
                    } catch (fehler) {
                        console.log(fehler);
                    }
                }
                return Response.json("Error", { status: 400 });
            }
        }

        // 404s
        return new Response("Page not found", { status: 404 });
    },
    });

    console.log(`Listening on ${server.url}`);
}
