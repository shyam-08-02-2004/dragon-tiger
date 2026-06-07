const fs = require('fs');

let content = fs.readFileSync('C:/dragonTiger/src/components/AdminPanel.tsx', 'utf8');

content = content.replace("import React, { useState, useEffect } from 'react';", "import React, { useState, useEffect } from 'react';\nimport { showCasinoAlert, showCasinoConfirm } from '../utils/casinoAlert';");

content = content.replace("const handleClearChatHistory = () => {", "const handleClearChatHistory = async () => {");
content = content.replace("if (!window.confirm(`Are you sure you want to delete the chat history for ${selectedSupportUser}?`)) return;", "if (!(await showCasinoConfirm('Clear Chat', `Are you sure you want to delete the chat history for ${selectedSupportUser}?`))) return;");

content = content.replace("const handleUpdateBalance = (userId: string, newBalance: number) => {", "const handleUpdateBalance = async (userId: string, newBalance: number) => {");
content = content.replace('if (isNaN(amount) || amount < 0) { alert("Invalid balance amount"); return; }', 'if (isNaN(amount) || amount < 0) { await showCasinoAlert("Error", "Invalid balance amount", "error"); return; }');

content = content.replace("const handleDeleteUser = (userId: string) => {", "const handleDeleteUser = async (userId: string) => {");
content = content.replace("if (!window.confirm('Are you sure you want to delete this user?')) return;", "if (!(await showCasinoConfirm('Delete User', 'Are you sure you want to delete this user?'))) return;");

content = content.replace("const handleDeleteTransaction = async (txId: string) => {", "const handleDeleteTransaction = async (txId: string) => {"); // already async
content = content.replace("if (!window.confirm('Are you sure you want to delete this transaction record completely?')) return;", "if (!(await showCasinoConfirm('Delete Transaction', 'Are you sure you want to delete this transaction record completely?'))) return;");
content = content.replace('alert(err.error || "Failed to process transaction");', 'await showCasinoAlert("Error", err.error || "Failed to process transaction", "error");');
content = content.replace('alert("Failed to delete transaction");', 'await showCasinoAlert("Error", "Failed to delete transaction", "error");');

fs.writeFileSync('C:/dragonTiger/src/components/AdminPanel.tsx', content);
