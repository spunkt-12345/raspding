import { Database } from "bun:sqlite";
const db = new Database("mydb.sqlite", { create: true, strict: true });

let apiKey = 0
while (apiKey === 0) {
    apiKey = Math.random()
}

serve(db);

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
async function serve(db: Database) {
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

                // Login
                if (pfad === "login" && method === "post") {
                    const json = await req.json() as User;
                    const name = json.name, password = json.password
                    const result = db.query("SELECT password FROM user WHERE name = $name").get({ name: name }) as Password;
                    const passwortRichtig = await Bun.password.verify(password, result.password)
                    if (passwortRichtig) {
                        return Response.json({ key: apiKey })
                    }
                    return Response.json("Fehler", { status: 400 })
                }

                // Anzeige aller gespeicherter Daten
                if (pfad.substring(0, 3) === "get") {
                    const key = parseFloat(new URL(req.url).searchParams.get("key") as string)
                    if (key === apiKey) {
                        const result = db.query("SELECT * FROM daten").all()
                        return Response.json(result);
                    }
                    return Response.json("Fehler", { status: 403 })
                }

                // Zählen der Einträge
                if (pfad.substring(0, 6) === "anzahl") {
                    const key = parseFloat(new URL(req.url).searchParams.get("key") as string)
                    if (key === apiKey) {
                        const result = db.query("SELECT COUNT(*) AS anzahl FROM daten").get() as Anzahl;
                        const anzahl = result["anzahl"];
                        return Response.json(anzahl);
                    }
                     return Response.json("Fehler", { status: 403 })
                }                     
                
                // Hinzufügen neuer Einträge
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
