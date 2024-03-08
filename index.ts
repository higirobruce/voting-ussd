// src/index.ts
import express, { Request, Response } from "express";
import * as bodyParser from "body-parser";
import { Pool } from "pg";
import cors from "cors";

const DB_USER = process.env.DB_USER || "brucehigiro";
const DB_PASS = process.env.DB_PASS || "Blessings_19891";
const DB_HOST = process.env.DB_HOST || "127.0.0.1";
const DB_PORT = process.env.DB_PORT || "5432";
const DB_NAME = process.env.DB_NAME || "mydb";
const connectionString = `postgresql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

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

app.get("/votes", async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(`SELECT
              candidate_name,
              COUNT(*) AS total_votes,
              COUNT(*) * 100.0 / SUM(COUNT(*)) OVER () AS percentage
            FROM votes
            GROUP BY candidate_name`);
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
      // This is the first request. Note how we start the response with CON
      res.header("Freeflow", "fc");
      response = `Ikaze. Andika kode yawe.`;
    } else if (text.length >= 4) {
      //check code
      let t = "";
      votingCode = text;

      let r = await checkCode(text);

      if (r?.length < 1) {
        res.header("Freeflow", "fb");
        response = "CON Code ntibaho!";
      } else {
        candidates = [...r];
        r?.map((c) => {
          t += `${c?.id}. ${c.name}\n`;
        });
        res.header("Freeflow", "fc");
        response = `CON Hitamo UmuCandida muri aba
      ${t}
      `;
      }
    } else if (text.length === 1) {
      let r = await submitVote(
        votingCode,
        candidates?.filter((c) => c?.id == Number(text)),
        "success"
      );
      step = 0;
      if (r) {
        response = "CON Murakoze gutora";
        res.header("Freeflow", "fb");
      } else {
        response = "CON Ntibikunze. Mugerageze nanone";
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
  const foundCodes = await pool.query(
    `SELECT * FROM random_codes WHERE code='${code}'`
  );
  //get candidates

  const foundCandidates = await pool.query("SELECT * FROM candidates");

  if (foundCodes.rowCount == 0) {
    return [];
  } else {
    return foundCandidates?.rows;
  }
}

async function submitVote(code: string, candidates: any[], status: string) {
  try {
    let cand = candidates[0];
    let __id = cand?.id;
    let __name = cand?.name;
    console.log(cand);
    const insertedVotes = await pool.query(
      `INSERT into votes (candidate_id, candidate_name, voting_code, status) VALUES (${__id}, '${__name}', '${code}', '${status}')`
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
