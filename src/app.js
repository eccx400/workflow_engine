const fs = require("fs");
const { google } = require("googleapis");

const service = google.sheets("v4");
const credentials = require("./credentials.json");

const authClient = new google.auth.JWT(
    credentials.client_email,
    null,
    credentials.private_key.replace(/\\n/g, "\n"),
    ["https://www.googleapis.com/auth/spreadsheets"]
);

(async function () {
    try {
        const token = await authClient.authorize();

        authClient.setCredentials(token);

        const res = await service.spreadsheets.values.get({
            auth: authClient,
            spreadsheetId: "1wZbVip75JMmuMhu1oStP0MdsBknAZ9qfJx46ZHjER3E",
            range: "A:K",
        });

        const answers = [];
        const rows = res.data.values;

        if (rows.length) {
            rows.shift()

            for (const row of rows) {
                answers.push({ timeStamp: row[0], email: row[1], firstName: row[2], lastName: row[3], address: row[4], tshirtYellowStone: row[5], tshirtGrandTeton: row[6], tshirtGlacier: row[7], jacketYellowStone: row[8], jacketGrandTeton: row[9], jacketGlacier: row[10]});
            }
        } else {
            console.log("No data found.");  
        }

        fs.writeFileSync("answers.json", JSON.stringify(answers), function (err, file) {
            if (err) throw err;
            console.log("Saved!");
        });

    } catch (error) {
        console.log(error);
        process.exit(1);
    }
})();