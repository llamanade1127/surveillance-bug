"use strict";
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
const puppeteer_1 = __importDefault(require("puppeteer"));
//Twilo imports
// const accountSid = process.env.TWILIO_ACCOUNT_SID;
// const authToken = process.env.TWILIO_AUTH_TOKEN;
// const client = require('twilio')(accountSid, authToken);
const name = "Automatic Class Enroller";
//--Settings--
//Timezone of the EXECUTE_DATE
const TIMEZONE = "MST";
//The date and exact time to execute the program. TODO: do this
const EXECUTE_DATE = new Date('2022-11-3T20:24:00');
//Time between checks for the date in ms
const TIME_BETWEEN_DATE_ASSERTIONS = 100;
//If the program should use a advance way to know how long it needs before checking again. Saves memory
const ADVANCE_TIME_MODE = true;
//Amount of times to retry adding the classes before giving up.
const RETRY_AMOUNTS = 10;
//Number to text for testing
const DEV_NUM = "+19209011978";
//Number of client to text
const CLIENT_NUM = "+19209059932";
//Set to true for production mode
const IS_PROD = false;
//DO NOT CHANGE THESE DURING PROD
//Amount of time to wait between clicks with a +- value of 20.
const WAIT_BEFORE_CLICK = 50;
//The program will exit with a status code 1 after being successful
const EXIT_AFTER_COMPLETE = true;
//URL to starting page
const URL = "https://erau.collegescheduler.com/terms/Daytona-Prescott%202023%20Spring/cart";
//Max time to wait for element while waiting for page to load
const ELEMENT_WAIT_TIMEOUT_PL = 2147483646;
//Number of ms to wait for element to appear 
const ELEMENT_MAX_TIMEOUT = 10000;
//Path to the register button
const PATH_TO_REGISTER_BUTTON = 'html body section#scheduler-app div main.css-0 div.container.css-ivn467-contentCss-App div div.css-1er3bwj-headerCss span.page-controls span.hide-for-print button.css-6pmogs-hoverStyles-hoverStyles-defaultStyle-wideStyle';
//Path to the continue button on iFrame
const PATH_TO_CONTINUE_BUTTON = 'html body.modal-open div div.fade.css-1expkbz-modalCss.in.modal div.modal-dialog div.modal-content div.modal-footer button.css-6pmogs-hoverStyles-hoverStyles-defaultStyle-wideStyle';
//Path to the table containing all the failed classes data
const PATH_TO_REGISTERED_CLASSES_TABLE = 'html body.modal-open div div.fade.in.modal div.modal-dialog div.modal-content div.modal-body div.css-82jllk-statusCss div.css-7h3hm7-padCss div.css-808kkp-listCss';
//Number of attempts that we have made
let attempts = 0;
let browser;
let page;
//Wait for time to a certian date time, then call the callback function
function wait(date, fn) {
    debug(`${ADVANCE_TIME_MODE ?
        `ADVANCE_TIME_MODE is true. Function will wait ${clamp(date.getTime() - Date.now() - 1, 1, Number.MAX_SAFE_INTEGER)} before executing`
        : `ADVANCE_TIME_MODE is false. Waiting ${TIME_BETWEEN_DATE_ASSERTIONS} each time before executing`}`);
    setTimeout(() => {
        if (date.getTime() <= Date.now()) {
            debug(`${date.toDateString()} reached. Executing...`);
            fn();
        }
        else {
            wait(date, fn);
        }
    }, ADVANCE_TIME_MODE ? clamp(date.getTime() - Date.now() - 1, 1, Number.MAX_SAFE_INTEGER) : TIME_BETWEEN_DATE_ASSERTIONS);
}
//Attempts to add a class
function attempt() {
    return __awaiter(this, void 0, void 0, function* () {
        debug("Attempting to access classes");
        try {
            if (page == null || browser == null) {
                debug("Page or Browser are null!", DEBUG_LEVEL.FAIL);
                shutdown(-1);
            }
            //Wait for Register button
            page.waitForSelector(PATH_TO_REGISTER_BUTTON, { timeout: ELEMENT_MAX_TIMEOUT });
            //Click Register button
            page.click(PATH_TO_REGISTER_BUTTON);
            //Wait for iFrame
            page.waitForSelector(PATH_TO_CONTINUE_BUTTON, { timeout: ELEMENT_MAX_TIMEOUT });
            //Click continue.
            page.focus(PATH_TO_CONTINUE_BUTTON);
            page.click(PATH_TO_CONTINUE_BUTTON);
            //Load iFrame to see any errors.
            page.waitForSelector(PATH_TO_REGISTERED_CLASSES_TABLE);
            //Take a screenshot
            takeScreenshotAndSave(yield page.screenshot());
            //Report Errors and success
            parseClasses(page);
        }
        catch (e) {
            debug(`Error attempting to add class. Error: ${e}`, DEBUG_LEVEL.ERROR);
            text(IS_PROD ? DEV_NUM : CLIENT_NUM, `Error attempting to add class. Error: ${e}`);
            debug(`${attempts <= RETRY_AMOUNTS ? `Attemting to access classes again...` : `Reached maximum amount of attempts...`}`, DEBUG_LEVEL.ERROR);
            ++attempts;
            attempts <= RETRY_AMOUNTS ? attempt() : shutdown(-1);
        }
    });
}
function takeScreenshotAndSave(buf) {
}
function parseClasses(page) {
    //e
}
function text(number, message) {
}
function shutdown(code = 1) {
    process.exit(code);
}
function debug(log, dbl = DEBUG_LEVEL.LOG, sendMessage = false) {
    console.log(`${name} [${dbl.toString()}] | ${log}`);
    if (dbl == DEBUG_LEVEL.FAIL || dbl == DEBUG_LEVEL.WARNING || sendMessage) {
        text(IS_PROD ? CLIENT_NUM : DEV_NUM, log);
    }
}
function checkInputs() {
    return __awaiter(this, void 0, void 0, function* () {
        //Need to check the following:
        /**
        * EXECUTE_DATE
        * TWILIO
        *
        */
        try {
            if (EXECUTE_DATE.getTime() <= Date.now()) {
                debug("EXECUTE_DATE is a date before or exacty Date.now()", DEBUG_LEVEL.ERROR);
                shutdown(-1);
            }
        }
        catch (e) {
            debug("Error checking the date of EXECUTE_DATE. Most likley a invalid inputed date", DEBUG_LEVEL.FAIL);
            shutdown(-1);
        }
        try {
            var test = yield puppeteer_1.default.launch();
            test.close();
        }
        catch (e) {
            debug("Error starting puppeteer! Error: " + e);
            shutdown(-1);
        }
        debug("Passed input test");
    });
}
function loadPuppet() {
    return __awaiter(this, void 0, void 0, function* () {
        browser = yield puppeteer_1.default.launch({ headless: false });
        page = yield browser.newPage();
    });
}
function waitForElement(startPage, elemPath, callback) {
    return __awaiter(this, void 0, void 0, function* () {
        page.goto(startPage);
        yield page.waitForSelector(elemPath, { timeout: ELEMENT_WAIT_TIMEOUT_PL });
        if ((yield page.select(elemPath)) == null) {
            debug("Could not find element within the ELEMENT_WAIT_TIMEOUT time frame!", DEBUG_LEVEL.FAIL);
            shutdown(-1);
        }
        callback();
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        debug("Checking inputs");
        yield checkInputs();
        debug("loading puppeteer");
        yield loadPuppet();
        debug("Waiting for page");
        waitForElement(URL, PATH_TO_REGISTER_BUTTON, () => wait(EXECUTE_DATE, attempt));
    });
}
const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
var DEBUG_LEVEL;
(function (DEBUG_LEVEL) {
    DEBUG_LEVEL["LOG"] = "+";
    DEBUG_LEVEL["WARNING"] = "?";
    DEBUG_LEVEL["ERROR"] = "!";
    DEBUG_LEVEL["FAIL"] = "X";
})(DEBUG_LEVEL || (DEBUG_LEVEL = {}));
main();
