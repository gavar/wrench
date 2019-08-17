/* eslint-disable import/newline-after-import */
let env = require("dotenv").config();
env = require("dotenv-expand")(env);
Object.assign(process.env, env.parsed);
