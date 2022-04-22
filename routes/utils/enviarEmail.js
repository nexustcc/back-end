const nodemailer = require("nodemailer");

const SMTP_CONFIG = require("../../config/smtp");

const transporter = nodemailer.createTransport({
    host: SMTP_CONFIG.host,
    port: SMTP_CONFIG.port,
    secure: true,
    auth: {
        user: SMTP_CONFIG.user,
        pass: SMTP_CONFIG.pass,
    },
    tls: {
        rejectUnauthorized: false,
    },
});

async function run(senha, email, nome) {
    const mailSent = transporter.sendMail({
        text: `Olá, ${nome}! Sua senha é ${senha}`,
        subject: "Senha da Plataforma Nexus TCC",
        from: "Nexus TCC <suporte@nexustcc.software>",
        to: email,
    });

    console.log(mailSent);
}

module.exports = run;