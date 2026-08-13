function Notification({
  show,
  title,
  message,
  severity,
  onClose,
}) {
  if (!show) return null;

  const colors = {
    High: "#dc3545",
    Medium: "#fd7e14",
    Low: "#198754",
  };

  const icons = {
    High: "🔴",
    Medium: "🟠",
    Low: "🟢",
  };

  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        width: "380px",
        background: "#ffffff",
        borderRadius: "15px",
        borderLeft: `8px solid ${colors[severity]}`,
        boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
        padding: "20px",
        zIndex: 99999,
        animation: "slideIn 0.4s ease",
      }}
    >
      <h3
        style={{
          color: colors[severity],
          marginBottom: "10px",
        }}
      >
        🚨 DRIVER ALERT
      </h3>

      <hr />

      <h5>
        {icons[severity]} {severity.toUpperCase()} SEVERITY
      </h5>

      <div
        style={{
          whiteSpace: "pre-line",
          marginTop: "15px",
          marginBottom: "20px",
        }}
      >
        {message}
      </div>

      <button
        className="btn btn-danger w-100"
        onClick={onClose}
      >
        Dismiss
      </button>
    </div>
  );
}

export default Notification;