--
-- PostgreSQL database dump
--

-- Dumped from database version 15.5 (Homebrew)
-- Dumped by pg_dump version 15.6 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: generate_random_code(); Type: FUNCTION; Schema: public; Owner: brucehigiro
--

CREATE FUNCTION public.generate_random_code() RETURNS character varying
    LANGUAGE plpgsql
    AS $$
BEGIN
  RETURN
    LPAD(FLOOR(RAND() * 1000)::TEXT, 3, '0') ||
    CHR(65 + FLOOR(RAND() * 26));
END;
$$;


ALTER FUNCTION public.generate_random_code() OWNER TO brucehigiro;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: candidates; Type: TABLE; Schema: public; Owner: brucehigiro
--

CREATE TABLE public.candidates (
    id integer NOT NULL,
    name character varying(100) NOT NULL
);


ALTER TABLE public.candidates OWNER TO brucehigiro;

--
-- Name: candidates_id_seq; Type: SEQUENCE; Schema: public; Owner: brucehigiro
--

CREATE SEQUENCE public.candidates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.candidates_id_seq OWNER TO brucehigiro;

--
-- Name: candidates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: brucehigiro
--

ALTER SEQUENCE public.candidates_id_seq OWNED BY public.candidates.id;


--
-- Name: random_codes; Type: TABLE; Schema: public; Owner: brucehigiro
--

CREATE TABLE public.random_codes (
    id integer NOT NULL,
    code character varying(4) NOT NULL
);


ALTER TABLE public.random_codes OWNER TO brucehigiro;

--
-- Name: random_codes_id_seq; Type: SEQUENCE; Schema: public; Owner: brucehigiro
--

CREATE SEQUENCE public.random_codes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.random_codes_id_seq OWNER TO brucehigiro;

--
-- Name: random_codes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: brucehigiro
--

ALTER SEQUENCE public.random_codes_id_seq OWNED BY public.random_codes.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: brucehigiro
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    email character varying(100) NOT NULL,
    password character varying(100) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO brucehigiro;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: brucehigiro
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO brucehigiro;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: brucehigiro
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: votes; Type: TABLE; Schema: public; Owner: brucehigiro
--

CREATE TABLE public.votes (
    id integer NOT NULL,
    candidate_id integer,
    candidate_name character varying(100) NOT NULL,
    voting_code character varying(4) NOT NULL,
    status character varying(20) DEFAULT 'success'::character varying
);


ALTER TABLE public.votes OWNER TO brucehigiro;

--
-- Name: votes_id_seq; Type: SEQUENCE; Schema: public; Owner: brucehigiro
--

CREATE SEQUENCE public.votes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.votes_id_seq OWNER TO brucehigiro;

--
-- Name: votes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: brucehigiro
--

ALTER SEQUENCE public.votes_id_seq OWNED BY public.votes.id;


--
-- Name: candidates id; Type: DEFAULT; Schema: public; Owner: brucehigiro
--

ALTER TABLE ONLY public.candidates ALTER COLUMN id SET DEFAULT nextval('public.candidates_id_seq'::regclass);


--
-- Name: random_codes id; Type: DEFAULT; Schema: public; Owner: brucehigiro
--

ALTER TABLE ONLY public.random_codes ALTER COLUMN id SET DEFAULT nextval('public.random_codes_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: brucehigiro
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: votes id; Type: DEFAULT; Schema: public; Owner: brucehigiro
--

ALTER TABLE ONLY public.votes ALTER COLUMN id SET DEFAULT nextval('public.votes_id_seq'::regclass);


--
-- Data for Name: candidates; Type: TABLE DATA; Schema: public; Owner: brucehigiro
--

COPY public.candidates (id, name) FROM stdin;
1	John Doe
2	Jane Smith
3	Alex Johnson
\.


--
-- Data for Name: random_codes; Type: TABLE DATA; Schema: public; Owner: brucehigiro
--

COPY public.random_codes (id, code) FROM stdin;
1	001A
2	002B
3	003C
4	099Z
5	100A
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: brucehigiro
--

COPY public.users (id, username, email, password, created_at) FROM stdin;
1	user1	user1@example.com	password1	2024-03-05 16:03:48.238399
2	user2	user2@example.com	password2	2024-03-05 16:03:57.292056
\.


--
-- Data for Name: votes; Type: TABLE DATA; Schema: public; Owner: brucehigiro
--

COPY public.votes (id, candidate_id, candidate_name, voting_code, status) FROM stdin;
1	1	John Doe	001A	success
\.


--
-- Name: candidates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: brucehigiro
--

SELECT pg_catalog.setval('public.candidates_id_seq', 3, true);


--
-- Name: random_codes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: brucehigiro
--

SELECT pg_catalog.setval('public.random_codes_id_seq', 5, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: brucehigiro
--

SELECT pg_catalog.setval('public.users_id_seq', 2, true);


--
-- Name: votes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: brucehigiro
--

SELECT pg_catalog.setval('public.votes_id_seq', 1, true);


--
-- Name: candidates candidates_pkey; Type: CONSTRAINT; Schema: public; Owner: brucehigiro
--

ALTER TABLE ONLY public.candidates
    ADD CONSTRAINT candidates_pkey PRIMARY KEY (id);


--
-- Name: random_codes random_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: brucehigiro
--

ALTER TABLE ONLY public.random_codes
    ADD CONSTRAINT random_codes_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: brucehigiro
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: votes votes_pkey; Type: CONSTRAINT; Schema: public; Owner: brucehigiro
--

ALTER TABLE ONLY public.votes
    ADD CONSTRAINT votes_pkey PRIMARY KEY (id);


--
-- Name: votes votes_candidate_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: brucehigiro
--

ALTER TABLE ONLY public.votes
    ADD CONSTRAINT votes_candidate_id_fkey FOREIGN KEY (candidate_id) REFERENCES public.candidates(id);


--
-- PostgreSQL database dump complete
--

