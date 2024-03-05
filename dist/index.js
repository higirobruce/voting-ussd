"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/index.ts
const express_1 = __importDefault(require("express"));
const bodyParser = __importStar(require("body-parser"));
const pg_1 = require("pg");
const DB_USER = process.env.DB_USER || "brucehigiro";
const DB_PASS = process.env.DB_PASS || "Blessings_19891";
const DB_HOST = process.env.DB_HOST || "127.0.0.1";
const DB_PORT = process.env.DB_PORT || "5432";
const DB_NAME = process.env.DB_NAME || "mydb";
const connectionString = `postgresql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
const pool = new pg_1.Pool({
    connectionString,
});
let step = 0;
let candidates = [];
let votingCode = null;
app.get("/users", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { rows } = yield pool.query("SELECT * FROM users");
        res.json(rows);
    }
    catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
app.get("/codes", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { rows } = yield pool.query("SELECT * FROM random_codes");
        res.json(rows);
    }
    catch (error) {
        console.error("Error fetching random_codes:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
app.get("/candidates", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { rows } = yield pool.query("SELECT * FROM candidates");
        res.json(rows);
    }
    catch (error) {
        console.error("Error fetching candidates:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
app.get("/codes/:code", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(req.params);
        let { code } = req === null || req === void 0 ? void 0 : req.params;
        console.log(code);
        const { rows } = yield pool.query(`SELECT * FROM random_codes WHERE code='${code}'`);
        res.json(rows);
    }
    catch (error) {
        console.error("Error fetching random_codes:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
app.post("/ussd", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Read the variables sent via POST from our API
    try {
        const { sessionId, serviceCode, phoneNumber, text } = req === null || req === void 0 ? void 0 : req.body;
        let response = "";
        if (text == "") {
            // This is the first request. Note how we start the response with CON
            response = `CON Ikaze. Andika kode yawe.`;
        }
        else if (text.length >= 4) {
            //check code
            let t = "";
            votingCode = text;
            let r = yield checkCode(text);
            if ((r === null || r === void 0 ? void 0 : r.length) < 1) {
                response = "CON Code ntibaho!";
            }
            else {
                candidates = [...r];
                r === null || r === void 0 ? void 0 : r.map((c) => {
                    t += `${c === null || c === void 0 ? void 0 : c.id}. ${c.name}\n`;
                });
                response = `CON Hitamo UmuCandida muri aba
      ${t}
      `;
            }
        }
        else if (text.length === 1) {
            let r = yield submitVote(votingCode, candidates === null || candidates === void 0 ? void 0 : candidates.filter((c) => (c === null || c === void 0 ? void 0 : c.id) == Number(text)), "success");
            step = 0;
            if (r) {
                response = "CON Murakoze gutora";
            }
            else {
                response = "CON Ntibikunze. Mugerageze nanone";
            }
        }
        // Send the response back to the API
        res.set("Content-Type: text/plain");
        res.send(response);
    }
    catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
function checkCode(code) {
    return __awaiter(this, void 0, void 0, function* () {
        //check code
        const foundCodes = yield pool.query(`SELECT * FROM random_codes WHERE code='${code}'`);
        //get candidates
        const foundCandidates = yield pool.query("SELECT * FROM candidates");
        if (foundCodes.rowCount == 0) {
            return [];
        }
        else {
            return foundCandidates === null || foundCandidates === void 0 ? void 0 : foundCandidates.rows;
        }
    });
}
function submitVote(code, candidates, status) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let cand = candidates[0];
            let __id = cand === null || cand === void 0 ? void 0 : cand.id;
            let __name = cand === null || cand === void 0 ? void 0 : cand.name;
            console.log(cand);
            const insertedVotes = yield pool.query(`INSERT into votes (candidate_id, candidate_name, voting_code, status) VALUES (${__id}, '${__name}', '${code}', '${status}')`);
            return true;
        }
        catch (error) {
            console.error("Error submiting a vote:", error);
            return false;
        }
    });
}
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
