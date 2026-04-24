let environments = [];
let activeEnvironment = null;

document.addEventListener("DOMContentLoaded", () => {
  loadEnvironments();

  document
    .getElementById("addEnvironment")
    .addEventListener("click", addEnvironment);

  document
    .getElementById("environmentName")
    .addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        addEnvironment();
      }
    });
});

function loadEnvironments() {
  chrome.storage.sync.get(["environments", "activeEnvironment"], (result) => {
    environments = result.environments || [];
    activeEnvironment = result.activeEnvironment || null;
    renderEnvironments();
    updateActiveEnvironmentDisplay();
  });
}

function addEnvironment() {
  const nameInput = document.getElementById("environmentName");
  const name = nameInput.value.trim();

  if (!name) {
    showStatus("Please enter an environment name", "error");
    return;
  }

  if (environments.some((env) => env.name === name)) {
    showStatus("Environment already exists", "error");
    return;
  }

  const newEnv = {
    name: name,
    id: Date.now(),
  };

  environments.push(newEnv);

  if (environments.length === 1) {
    activeEnvironment = newEnv.id;
  }

  saveEnvironments();

  nameInput.value = "";
  nameInput.focus();

  showStatus("Environment added successfully", "success");
}

function removeEnvironment(id) {
  environments = environments.filter((env) => env.id !== id);

  if (activeEnvironment === id) {
    activeEnvironment = null;
  }

  saveEnvironments();
  showStatus("Environment removed", "success");
}

function setActiveEnvironment(id) {
  const env = environments.find((e) => e.id === id);
  if (env) {
    activeEnvironment = id;
    saveEnvironments();
    showStatus(`Switched to ${env.name}`, "success");
  }
}

function clearActiveEnvironment() {
  activeEnvironment = null;
  saveEnvironments();
  showStatus("Environment disabled", "info");
}

function saveEnvironments() {
  const activeEnv = environments.find((env) => env.id === activeEnvironment);
  const debugHeader = activeEnv
    ? [
        {
          name: "X-Debug",
          value: activeEnv.name,
          enabled: true,
        },
      ]
    : [];

  chrome.storage.sync.set(
    {
      environments: environments,
      activeEnvironment: activeEnvironment,
      debugHeaders: debugHeader,
    },
    () => {
      renderEnvironments();
      updateActiveEnvironmentDisplay();
    },
  );
}

function updateActiveEnvironmentDisplay() {
  const currentValue = document.getElementById("currentValue");
  const activeEnv = environments.find((env) => env.id === activeEnvironment);

  if (activeEnv) {
    currentValue.textContent = activeEnv.name;
    currentValue.className = "current-value active";
  } else {
    currentValue.textContent = "None";
    currentValue.className = "current-value";
  }
}

function renderEnvironments() {
  const container = document.getElementById("environmentsList");

  if (environments.length === 0) {
    container.innerHTML =
      '<div class="empty-state">No environments added yet</div>';
    return;
  }

  container.innerHTML = environments
    .map(
      (env) => `
    <div class="environment-item ${activeEnvironment === env.id ? "active" : ""}">
      <div class="environment-content">
        <div class="environment-name">${escapeHtml(env.name)}</div>
        ${activeEnvironment === env.id ? '<span class="active-badge">ACTIVE</span>' : ""}
      </div>
      <div class="environment-actions">
        ${
          activeEnvironment === env.id
            ? '<button class="btn-disable" data-id="' +
              env.id +
              '">Disable</button>'
            : '<button class="btn-activate" data-id="' +
              env.id +
              '">Activate</button>'
        }
        <button class="btn-remove" data-id="${env.id}">×</button>
      </div>
    </div>
  `,
    )
    .join("");

  container.querySelectorAll(".btn-activate").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      setActiveEnvironment(parseInt(e.target.dataset.id, 10));
    });
  });

  container.querySelectorAll(".btn-disable").forEach((btn) => {
    btn.addEventListener("click", () => {
      clearActiveEnvironment();
    });
  });

  container.querySelectorAll(".btn-remove").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      removeEnvironment(parseInt(e.target.dataset.id, 10));
    });
  });
}

function showStatus(message, type = "info") {
  const status = document.getElementById("status");
  status.textContent = message;
  status.className = `status ${type}`;

  setTimeout(() => {
    status.textContent = "";
    status.className = "status";
  }, 3000);
}

function escapeHtml(text) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
