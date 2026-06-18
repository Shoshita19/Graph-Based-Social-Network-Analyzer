// Graph Data
let graph = JSON.parse(localStorage.getItem("socialGraph")) || {};

// DOM Elements
const userName = document.getElementById("userName");
const addUserBtn = document.getElementById("addUserBtn");

const user1 = document.getElementById("user1");
const user2 = document.getElementById("user2");

const connectBtn = document.getElementById("connectBtn");

const startNode = document.getElementById("startNode");
const bfsBtn = document.getElementById("bfsBtn");
const dfsBtn = document.getElementById("dfsBtn");

const bfsResult = document.getElementById("bfsResult");
const dfsResult = document.getElementById("dfsResult");

const influencerBtn = document.getElementById("influencerBtn");
const influencerResult = document.getElementById("influencerResult");

const totalUsers = document.getElementById("totalUsers");
const totalConnections = document.getElementById("totalConnections");
const topInfluencer = document.getElementById("topInfluencer");

const userList = document.getElementById("userList");

const searchUser = document.getElementById("searchUser");
const searchBtn = document.getElementById("searchBtn");
const searchResult = document.getElementById("searchResult");

const deleteUserSelect = document.getElementById("deleteUserSelect");
const deleteUserBtn = document.getElementById("deleteUserBtn");

const themeToggle = document.getElementById("themeToggle");

const graphSVG = document.getElementById("graphSVG");

const downloadReport = document.getElementById("downloadReport");

// Save Graph
function saveGraph() {
    localStorage.setItem("socialGraph", JSON.stringify(graph));
}

// Update Dropdowns
function updateDropdowns() {

    const selects = [user1, user2, startNode, deleteUserSelect];

    selects.forEach(select => {
        const firstOption = select.options[0].outerHTML;
        select.innerHTML = firstOption;

        Object.keys(graph).forEach(user => {
            const option = document.createElement("option");
            option.value = user;
            option.textContent = user;
            select.appendChild(option);
        });
    });

    updateUserList();
    updateStats();
    drawGraph();
}

// Add User
addUserBtn.addEventListener("click", () => {

    const name = userName.value.trim();

    if (!name) {
        alert("Enter a user name");
        return;
    }

    if (graph[name]) {
        alert("User already exists");
        return;
    }

    graph[name] = [];

    saveGraph();
    updateDropdowns();

    userName.value = "";

    alert("User added successfully");
});

// Add Connection
connectBtn.addEventListener("click", () => {

    const u1 = user1.value;
    const u2 = user2.value;

    if (!u1 || !u2) {
        alert("Select both users");
        return;
    }

    if (u1 === u2) {
        alert("Cannot connect same user");
        return;
    }

    if (!graph[u1].includes(u2))
        graph[u1].push(u2);

    if (!graph[u2].includes(u1))
        graph[u2].push(u1);

    saveGraph();
    updateStats();
    drawGraph();

    alert("Connection added");
});

// BFS
function bfs(start) {

    let visited = new Set();
    let queue = [start];
    let result = [];

    visited.add(start);

    while (queue.length > 0) {

        let node = queue.shift();

        result.push(node);

        graph[node].forEach(neighbor => {

            if (!visited.has(neighbor)) {

                visited.add(neighbor);
                queue.push(neighbor);
            }
        });
    }

    return result;
}

// DFS
function dfs(node, visited = new Set(), result = []) {

    visited.add(node);

    result.push(node);

    graph[node].forEach(neighbor => {

        if (!visited.has(neighbor)) {
            dfs(neighbor, visited, result);
        }
    });

    return result;
}

// Run BFS
bfsBtn.addEventListener("click", () => {

    const start = startNode.value;

    if (!start) {
        alert("Select start node");
        return;
    }

    bfsResult.textContent = bfs(start).join(" → ");
});

// Run DFS
dfsBtn.addEventListener("click", () => {

    const start = startNode.value;

    if (!start) {
        alert("Select start node");
        return;
    }

    dfsResult.textContent = dfs(start).join(" → ");
});

// Influencer Detection
function findInfluencer() {

    let influencer = "";
    let maxConnections = -1;

    for (let user in graph) {

        if (graph[user].length > maxConnections) {

            maxConnections = graph[user].length;
            influencer = user;
        }
    }

    return {
        user: influencer,
        connections: maxConnections
    };
}

influencerBtn.addEventListener("click", () => {

    if (Object.keys(graph).length === 0) {
        alert("No users available");
        return;
    }

    const result = findInfluencer();

    influencerResult.textContent =
        `${result.user} (${result.connections} connections)`;
});

// Search User
searchBtn.addEventListener("click", () => {

    const name = searchUser.value.trim();

    if (!name) {
        return;
    }

    if (graph[name]) {

        searchResult.innerHTML =
            `✅ ${name} found with ${graph[name].length} connection(s)`;

    } else {

        searchResult.innerHTML =
            `❌ User not found`;
    }
});

// Delete User
deleteUserBtn.addEventListener("click", () => {

    const user = deleteUserSelect.value;

    if (!user) {
        alert("Select a user");
        return;
    }

    delete graph[user];

    for (let person in graph) {
        graph[person] =
            graph[person].filter(friend => friend !== user);
    }

    saveGraph();
    updateDropdowns();

    alert("User deleted");
});

// Statistics
function updateStats() {

    totalUsers.textContent =
        Object.keys(graph).length;

    let connections = 0;

    for (let user in graph) {
        connections += graph[user].length;
    }

    totalConnections.textContent =
        connections / 2;

    const influencer = findInfluencer();

    topInfluencer.textContent =
        influencer.user || "None";
}

// User List
function updateUserList() {

    userList.innerHTML = "";

    Object.keys(graph).forEach(user => {

        const li = document.createElement("li");

        li.textContent =
            `${user} (${graph[user].length} connections)`;

        userList.appendChild(li);
    });
}

// Dark Mode
themeToggle.addEventListener("click", () => {

    document.body.classList.toggle("dark");

    localStorage.setItem(
        "theme",
        document.body.classList.contains("dark")
            ? "dark"
            : "light"
    );
});

// Load Theme
if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
}

// Draw Graph
function drawGraph() {

    graphSVG.innerHTML = "";

    const users = Object.keys(graph);

    if (users.length === 0) return;

    const width = graphSVG.clientWidth || 900;
    const height = graphSVG.clientHeight || 450;

    let positions = {};

    users.forEach((user, index) => {

        const angle =
            (2 * Math.PI * index) / users.length;

        const x =
            width / 2 +
            Math.cos(angle) * 150;

        const y =
            height / 2 +
            Math.sin(angle) * 150;

        positions[user] = { x, y };
    });

    // Draw edges
    users.forEach(user => {

        graph[user].forEach(friend => {

            if (user < friend) {

                const line =
                    document.createElementNS(
                        "http://www.w3.org/2000/svg",
                        "line"
                    );

                line.setAttribute(
                    "x1",
                    positions[user].x
                );

                line.setAttribute(
                    "y1",
                    positions[user].y
                );

                line.setAttribute(
                    "x2",
                    positions[friend].x
                );

                line.setAttribute(
                    "y2",
                    positions[friend].y
                );

                line.setAttribute(
                    "class",
                    "edge"
                );

                graphSVG.appendChild(line);
            }
        });
    });

    // Draw nodes
    users.forEach(user => {

        const circle =
            document.createElementNS(
                "http://www.w3.org/2000/svg",
                "circle"
            );

        circle.setAttribute(
            "cx",
            positions[user].x
        );

        circle.setAttribute(
            "cy",
            positions[user].y
        );

        circle.setAttribute("r", 25);

        circle.setAttribute(
            "class",
            "node"
        );

        graphSVG.appendChild(circle);

        const text =
            document.createElementNS(
                "http://www.w3.org/2000/svg",
                "text"
            );

        text.setAttribute(
            "x",
            positions[user].x
        );

        text.setAttribute(
            "y",
            positions[user].y
        );

        text.setAttribute(
            "class",
            "node-text"
        );

        text.textContent = user;

        graphSVG.appendChild(text);
    });
}

// Download Report
downloadReport.addEventListener("click", () => {

    const influencer = findInfluencer();

    let report = `
GRAPH-BASED SOCIAL NETWORK ANALYZER REPORT

Total Users: ${Object.keys(graph).length}

Total Connections: ${totalConnections.textContent}

Top Influencer: ${influencer.user}

Graph Data:
${JSON.stringify(graph, null, 2)}

Generated On:
${new Date().toLocaleString()}
`;

    const blob =
        new Blob([report], { type: "text/plain" });

    const link =
        document.createElement("a");

    link.href =
        URL.createObjectURL(blob);

    link.download =
        "Social_Network_Report.txt";

    link.click();
});

// Initialize
updateDropdowns();
drawGraph();
updateStats();