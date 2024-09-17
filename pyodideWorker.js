importScripts("https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js");

let pyodideReady = false;
let pyodide = null;

async function loadPyodideEnv() {
  pyodide = await loadPyodide();
  await pyodide.loadPackage("sympy");

  let initCode = `
from sympy import symbols, Eq, cos, sin, solve, sqrt, pi, latex
rx, ry, rz, phi = symbols('rx ry rz phi')
  `;
  await pyodide.runPythonAsync(initCode);
  pyodideReady = true;
  postMessage({ type: "ready" });
}

onmessage = async function (event) {
  if (event.data.type === "init") {
    loadPyodideEnv();
  } else if (event.data.type === "run") {
    if (pyodideReady) {
      let result;
      try {
        result = await pyodide.runPythonAsync(event.data.code);
        result = result.replace(/ight/g, "\\right");
        result = result.replace(/, \\left/g, ",\\\\ \\left");

        // Check if result is empty
        if (!result.trim()) {
          result = "无法计算";
        }
      } catch (error) {
        result = `Error: ${error.message}`;
      }
      postMessage({ type: "result", result: result });
    } else {
      postMessage({ type: "error", message: "Pyodide is not ready yet." });
    }
  }
};
