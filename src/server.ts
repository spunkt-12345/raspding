import { Database } from "bun:sqlite";
const db = new Database("mydb.sqlite", { create: true, strict: true });

// make(db); insert(db); show(db);
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
        insertData.run(data);
    } catch (fehler) {
        console.log(fehler);
    }
}

function show(db: Database) {
    console.log(db.query("SELECT * FROM daten").get())
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
        if (path === "/redir") return Response.redirect("/source", 301);

        // send back a file (in this case, *this* file)
        // if (path === "/source") return new Response(Bun.file(import.meta.path));

        // respond with JSON
        if (path === "/api/v1/get") {
            // console.log("get")
            const result = db.query("SELECT * FROM daten").all()
            return Response.json(result);
        }
        if (path === "/api/v1/anzahl") {
            // console.log("anzahl")
            const result = db.query("SELECT COUNT(*) AS anzahl FROM daten").get() as Anzahl;
            const anzahl = result["anzahl"];
            return Response.json(anzahl);
        }                                    
        if (path === "/api") return Response.json({ some: "buns", for: "you" });

        // receive JSON data to a POST request
        if (req.method === "POST" && path === "/api/post") {
        const json = await req.json() as Daten;
        if (json.name !== "" && json.data !== "") {
            const sql = "INSERT INTO daten (name, data) VALUES ($name, $data)";
            const data = { name: json.name, data: json.data };
            try {
                const insertData = db.prepare(sql);
                insertData.run(data);
            } catch (fehler) {
                console.log(fehler);
            }
            return Response.json({ success: true, data });
        }
        return Response.json("Error", { status: 400 });
        }

        // receive POST data from a form
        if (req.method === "POST" && path === "/form") {
        const data = await req.formData();
        console.log(data.get("someField"));
        return new Response("Success");
        }

        // 404s
        return new Response("Page not found", { status: 404 });
    },
    });

    console.log(`Listening on ${server.url}`);
}
