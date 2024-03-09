// src/index.ts
import express, { Request, Response } from "express";
import * as bodyParser from "body-parser";
import { Pool } from "pg";
import cors from "cors";
import session from "express-session";
import cookieParser from "cookie-parser";

const DB_USER = process.env.DB_USER || "brucehigiro";
const DB_PASS = process.env.DB_PASS || "Blessings_19891";
const DB_HOST = process.env.DB_HOST || "127.0.0.1";
const DB_PORT = process.env.DB_PORT || "5432";
const DB_NAME = process.env.DB_NAME || "mydb";
const connectionString = `postgresql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;

const app = express();
const port = process.env.PORT || 3000;
const oneDay = 1000 * 60 * 60 * 24;

declare module "express-session" {
  export interface SessionData {
    user: any;
    userId: any;
    accessToken: any;
    ussdStep: any;
  }
}

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  session({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized: true,
    cookie: { maxAge: oneDay },
    resave: false,
  })
);

const pool = new Pool({
  connectionString,
});

let step = 0;
let candidates: any[] = [];
let votingCode: any = null;

app.get("/users", async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query("SELECT * FROM users");
    res.json(rows);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal Server Error", message: error });
  }
});

app.get("/codes", async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query("SELECT * FROM random_codes");
    res.json(rows);
  } catch (error) {
    console.error("Error fetching random_codes:", error);
    res.status(500).json({ error: "Internal Server Error", message: error });
  }
});

app.get("/candidates", async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query("SELECT * FROM candidates");
    res.json(rows);
  } catch (error) {
    console.error("Error fetching candidates:", error);
    res.status(500).json({ error: "Internal Server Error", message: error });
  }
});

app.get("/total_votes", async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(`SELECT
              COUNT(*) AS total_votes
            FROM votes`);
    res.json(rows);
  } catch (error) {
    console.error("Error fetching candidates:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/total_approved_votes", async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(`SELECT
              COUNT(*) AS total_votes
            FROM votes where status='approved'`);
    res.json(rows);
  } catch (error) {
    console.error("Error fetching candidates:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/total_denied_votes", async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(`SELECT
              COUNT(*) AS total_votes
            FROM votes where status='denied'`);
    res.json(rows);
  } catch (error) {
    console.error("Error fetching candidates:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/approved_votes", async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(`SELECT
    candidate_name,
    SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) AS approved_votes,
    COUNT(*) AS total_votes,
    (SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) * 100.0) / COUNT(*) AS percentage_of_approved_votes
  FROM votes
  GROUP BY candidate_name;`);
    // const { rows } = await pool.query(`SELECT
    //           candidate_name,
    //           COUNT(*) AS total_votes,
    //           COUNT(*) * 100.0 / SUM(COUNT(*)) OVER () AS percentage
    //         FROM votes
    //         where status='approved'
    //         GROUP BY candidate_name`);
    res.json(rows);
  } catch (error) {
    console.error("Error fetching candidates:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/codes/:code", async (req: Request, res: Response) => {
  try {
    console.log(req.params);
    let { code } = req?.params;
    console.log(code);
    const { rows } = await pool.query(
      `SELECT * FROM random_codes WHERE code='${code}'`
    );
    res.json(rows);
  } catch (error) {
    console.error("Error fetching random_codes:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/ussd", async (req: Request, res: Response) => {
  // Read the variables sent via POST from our API

  try {
    const { sessionId, serviceCode, phoneNumber, text } = req?.body;
    let response = "";
    if (text == "" || text == "189") {
      step = 1;
      req.session.ussdStep = 1;
      // This is the first request. Note how we start the response with CON
      res.header("Freeflow", "fc");
      response = `Ikaze. Andika kode yawe.`;
    } else if (text.length >= 4) {
      req.session.ussdStep = 2;

      //check code
      let t = "";
      votingCode = text;

      let r = await checkCode(text);

      if (r?.length < 1) {
        res.header("Freeflow", "fb");
        response = "Kode ntibaho!";
      } else {
        candidates = [...r];
        r?.map((c) => {
          t += `${c?.id}. ${c.name}\n`;
        });

        res.header("Freeflow", "fc");
        response = `Hitamo Umu kandida \n${t}`;
      }
    } else if (text.length === 1 && text == "1") {
      req.session.ussdStep = 3;
      req.session.userId = text;
      res.header("Freeflow", "fc");
      response = "Emeza \n11. Yego\n12. Oya, Ndifashe";
    } else if (text.length === 2) {
      let choice = req.session.userId;
      let r = await submitVote(
        votingCode,
        candidates?.filter((c) => c?.id == 1),
        text == "11" ? "approved" : "denied",
        req.body?.phoneNumber
      );
      step = 0;
      if (r) {
        response = "Murakoze gutora";
        res.header("Freeflow", "fb");
      } else {
        response = "Ntibikunze. Mugerageze nanone";
        res.header("Freeflow", "fb");
      }
    } else {
      res.header("Freeflow", "fb");
      response = `Code ntibaho!`;
    }

    // Send the response back to the API
    res.set("Content-Type: text/plain");

    res.send(response);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error", message: error });
  }
});

async function checkCode(code: string) {
  //check code
  console.log(code.toUpperCase());
  const foundCodes = await pool.query(
    `SELECT * FROM random_codes WHERE code='${code.toUpperCase()}'`
  );
  //get candidates

  const foundCandidates = await pool.query("SELECT * FROM candidates");

  if (foundCodes.rowCount == 0) {
    return [];
  } else {
    //   await submitVote(code, [{
    //     "id": 5,
    //     "name": "Impfabusa"
    // }], 'pending')
    return foundCandidates?.rows;
  }
}

async function submitVote(
  code: string,
  candidates: any[],
  status: string,
  phoneNumber: string
) {
  try {
    let cand = candidates[0];
    let __id = cand?.id;
    let __name = cand?.name;

    await pool.query(
      `INSERT into votes (candidate_id, candidate_name, voting_code, status) VALUES (${__id}, '${__name}', '${code.toUpperCase()}', '${status}')`
    );

    await pool.query(
      `INSERT into votes_with_phone (candidate_id, candidate_name, voting_code, phoneNumber) VALUES (${__id}, '${__name}', '${code.toUpperCase()}', '${phoneNumber}' )`
    );

    return true;
  } catch (error) {
    console.error("Error submiting a vote:", error);
    return false;
  }
}

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
