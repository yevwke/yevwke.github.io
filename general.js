

document.addEventListener("DOMContentLoaded", () => {
    const user = "yev" + "wke";
    const domain = "gm" + "ail";
    const email = user + "@" + domain + "." + "com";
    const emailLink = document.getElementById("email-link");
    if (emailLink) {
        emailLink.href = "mailto:" + email;
    }

    renderProjects();
    initBackground();
});

