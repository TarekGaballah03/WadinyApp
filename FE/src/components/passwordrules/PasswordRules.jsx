function PasswordRules({ email, password, isDarkMode }) {
  if (!password) return null;

  const rules = [
    { text: "Password cannot be same as email", valid: password !== email },
    { text: "At least 6 characters", valid: password.length >= 6 },
  ];

  return (
    <ul className={`text-xs mt-1.5 list-none p-0 ${
      isDarkMode ? 'text-red-400' : 'text-red-500'
    }`}>
      {rules.map((rule, idx) => (
        <li
          key={idx}
          style={{ textDecoration: rule.valid ? "line-through" : "none" }}
        >
          {rule.text}
        </li>
      ))}
    </ul>
  );
}

export default PasswordRules;