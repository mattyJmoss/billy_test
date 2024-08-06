import React, { useState, useRef, useEffect } from "react";

const sidebarItemStyle = {
  padding: "10px",
  cursor: "pointer",
  borderRadius: "4px",
  marginBottom: "5px"
};

const inputStyle = {
  display: "block",
  width: "100%",
  padding: "8px",
  marginBottom: "10px",
  borderRadius: "4px",
  border: "1px solid #ddd"
};

const buttonStyle = {
  padding: "10px 15px",
  backgroundColor: "#0070f3",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  marginBottom: "10px"
};

const BudgetTracker = () => {
  const [budgets, setBudgets] = useState([
    { name: "Monthly Bills", items: [] },
    { name: "Subscriptions", items: [] },
    { name: "Savings", items: [] }
  ]);
  const [activeBudget, setActiveBudget] = useState("Monthly Bills");
  const [newItem, setNewItem] = useState({
    name: "",
    amount: "",
    isAutomatic: false,
    frequency: "monthly"
  });
  const [isFormExpanded, setIsFormExpanded] = useState(false);
  const [totalEarned, setTotalEarned] = useState(10000);
  const [isTotalEarnedEditing, setIsTotalEarnedEditing] = useState(false);
  const [isNewBudgetFormVisible, setIsNewBudgetFormVisible] = useState(false);
  const [newBudgetName, setNewBudgetName] = useState("");
  const [editingItemId, setEditingItemId] = useState(null);
  const formRef = useRef(null);
  const totalEarnedRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (formRef.current && !formRef.current.contains(event.target)) {
        setIsFormExpanded(false);
      }
      if (
        totalEarnedRef.current &&
        !totalEarnedRef.current.contains(event.target)
      ) {
        setIsTotalEarnedEditing(false);
      }
      if (!event.target.closest(".transaction-amount")) {
        setEditingItemId(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const addItem = (e) => {
    e.preventDefault();
    if (newItem.name && newItem.amount) {
      const itemToAdd = {
        ...newItem,
        id: Date.now(),
        amount: parseFloat(newItem.amount),
        isSkipped: false,
        isPaid: false,
        lastPaidDate: null
      };
      setBudgets((prevBudgets) =>
        prevBudgets.map((budget) =>
          budget.name === activeBudget
            ? { ...budget, items: [...budget.items, itemToAdd] }
            : budget
        )
      );
      setNewItem({
        name: "",
        amount: "",
        isAutomatic: false,
        frequency: "monthly"
      });
      setIsFormExpanded(false);
    }
  };

  const addNewBudget = (e) => {
    e.preventDefault();
    if (newBudgetName) {
      setBudgets([...budgets, { name: newBudgetName, items: [] }]);
      setNewBudgetName("");
      setIsNewBudgetFormVisible(false);
    }
  };

  const updateItemAmount = (budgetName, itemId, newAmount) => {
    setBudgets((prevBudgets) =>
      prevBudgets.map((budget) =>
        budget.name === budgetName
          ? {
              ...budget,
              items: budget.items.map((item) =>
                item.id === itemId
                  ? { ...item, amount: parseFloat(newAmount) }
                  : item
              )
            }
          : budget
      )
    );
    setEditingItemId(null);
  };

  const toggleItemSkipped = (budgetName, itemId) => {
    setBudgets((prevBudgets) =>
      prevBudgets.map((budget) =>
        budget.name === budgetName
          ? {
              ...budget,
              items: budget.items.map((item) =>
                item.id === itemId
                  ? { ...item, isSkipped: !item.isSkipped, isPaid: false }
                  : item
              )
            }
          : budget
      )
    );
  };

  const markItemAsPaid = (budgetName, itemId) => {
    const currentDate = new Date();
    setBudgets((prevBudgets) =>
      prevBudgets.map((budget) =>
        budget.name === budgetName
          ? {
              ...budget,
              items: budget.items.map((item) =>
                item.id === itemId
                  ? {
                      ...item,
                      isPaid: true,
                      isSkipped: false,
                      lastPaidDate: currentDate.toISOString()
                    }
                  : item
              )
            }
          : budget
      )
    );
  };

  const renderItems = (items, budgetName) => (
    <div>
      {items.map((item) => (
        <div
          key={item.id}
          style={{
            border: "1px solid #ddd",
            borderRadius: "4px",
            padding: "10px",
            marginBottom: "10px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: item.isSkipped
              ? "#f0f0f0"
              : item.isPaid
              ? "#e6ffe6"
              : "white"
          }}
        >
          <div>
            <div style={{ fontWeight: "bold" }}>{item.name}</div>
            <div style={{ fontSize: "0.8em", color: "#666" }}>
              {item.isAutomatic ? "Automatic" : "Manual"} | {item.frequency}
              {item.lastPaidDate &&
                ` | Last paid: ${new Date(
                  item.lastPaidDate
                ).toLocaleDateString()}`}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            {editingItemId === item.id ? (
              <input
                type="number"
                defaultValue={item.amount}
                onBlur={(e) =>
                  updateItemAmount(budgetName, item.id, e.target.value)
                }
                autoFocus
                style={{ width: "80px", marginRight: "10px" }}
              />
            ) : (
              <div
                className="transaction-amount"
                onClick={() => setEditingItemId(item.id)}
                style={{
                  fontWeight: "bold",
                  fontSize: "1.1em",
                  marginRight: "10px",
                  cursor: "pointer"
                }}
              >
                ${item.amount.toFixed(2)}
              </div>
            )}
            <button
              onClick={() => toggleItemSkipped(budgetName, item.id)}
              style={{
                marginRight: "5px",
                padding: "5px 10px",
                backgroundColor: item.isSkipped ? "#f0f0f0" : "#0070f3",
                color: item.isSkipped ? "black" : "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              {item.isSkipped ? "Unskip" : "Skip"}
            </button>
            <button
              onClick={() => markItemAsPaid(budgetName, item.id)}
              style={{
                padding: "5px 10px",
                backgroundColor: item.isPaid ? "#4CAF50" : "#0070f3",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer"
              }}
              disabled={item.isPaid}
            >
              {item.isPaid ? "Paid" : "Mark as Paid"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const totalSpend = budgets.reduce(
    (total, budget) =>
      total +
      budget.items.reduce(
        (sum, item) => (item.isSkipped ? sum : sum + item.amount),
        0
      ),
    0
  );
  const overflow = totalEarned - totalSpend;

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        display: "flex",
        minHeight: "100vh"
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: "250px",
          backgroundColor: "#f0f0f0",
          padding: "20px",
          display: "flex",
          flexDirection: "column"
        }}
      >
        {budgets.map((budget) => (
          <div
            key={budget.name}
            onClick={() => setActiveBudget(budget.name)}
            style={{
              ...sidebarItemStyle,
              backgroundColor:
                activeBudget === budget.name ? "#0070f3" : "transparent",
              color: activeBudget === budget.name ? "white" : "black"
            }}
          >
            {budget.name}
            <span style={{ float: "right", fontWeight: "bold" }}>
              $
              {budget.items
                .reduce(
                  (sum, item) => (item.isSkipped ? sum : sum + item.amount),
                  0
                )
                .toFixed(2)}
            </span>
          </div>
        ))}
        <button
          style={buttonStyle}
          onClick={() => setIsNewBudgetFormVisible(true)}
        >
          Add New Budget
        </button>
        {isNewBudgetFormVisible && (
          <form onSubmit={addNewBudget}>
            <input
              style={inputStyle}
              type="text"
              placeholder="New Budget Name"
              value={newBudgetName}
              onChange={(e) => setNewBudgetName(e.target.value)}
            />
            <button type="submit" style={buttonStyle}>
              Create Budget
            </button>
          </form>
        )}
        <div
          style={{
            marginTop: "auto",
            backgroundColor: "white",
            padding: "15px",
            borderRadius: "4px"
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
            ref={totalEarnedRef}
          >
            <span>Total Earned:</span>
            {isTotalEarnedEditing ? (
              <input
                type="number"
                value={totalEarned}
                onChange={(e) =>
                  setTotalEarned(parseFloat(e.target.value) || 0)
                }
                onBlur={() => setIsTotalEarnedEditing(false)}
                autoFocus
                style={{
                  ...inputStyle,
                  width: "80px",
                  marginBottom: 0,
                  padding: "2px 5px"
                }}
              />
            ) : (
              <span
                style={{
                  color: "green",
                  fontWeight: "bold",
                  cursor: "pointer"
                }}
                onClick={() => setIsTotalEarnedEditing(true)}
              >
                ${totalEarned.toFixed(2)}
              </span>
            )}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Total Spend:</span>
            <span style={{ color: "red", fontWeight: "bold" }}>
              ${totalSpend.toFixed(2)}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Overflow:</span>
            <span style={{ color: "green", fontWeight: "bold" }}>
              ${overflow.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: "20px", overflowY: "auto" }}>
        <h2>{activeBudget}</h2>
        {renderItems(
          budgets.find((budget) => budget.name === activeBudget)?.items || [],
          activeBudget
        )}

        <div
          style={{
            marginTop: "20px",
            border: "1px solid #ddd",
            borderRadius: "4px",
            padding: "15px"
          }}
        >
          <form onSubmit={addItem} ref={formRef}>
            <input
              style={inputStyle}
              type="text"
              placeholder="New Item Name"
              value={newItem.name}
              onChange={(e) => {
                setNewItem({ ...newItem, name: e.target.value });
                if (!isFormExpanded) setIsFormExpanded(true);
              }}
              onFocus={() => setIsFormExpanded(true)}
            />
            {isFormExpanded && (
              <>
                <input
                  style={inputStyle}
                  type="number"
                  placeholder="Amount"
                  value={newItem.amount}
                  onChange={(e) =>
                    setNewItem({ ...newItem, amount: e.target.value })
                  }
                />
                <div style={{ marginBottom: "10px" }}>
                  <label style={{ marginRight: "10px" }}>
                    <input
                      type="checkbox"
                      checked={newItem.isAutomatic}
                      onChange={(e) =>
                        setNewItem({
                          ...newItem,
                          isAutomatic: e.target.checked
                        })
                      }
                    />
                    Automatic
                  </label>
                  <select
                    style={{
                      ...inputStyle,
                      display: "inline-block",
                      width: "auto"
                    }}
                    value={newItem.frequency}
                    onChange={(e) =>
                      setNewItem({ ...newItem, frequency: e.target.value })
                    }
                  >
                    <option value="monthly">Monthly</option>
                    <option value="bimonthly">Every Other Month</option>
                    <option value="quarterly">Quarterly</option>
                  </select>
                </div>
                <button type="submit" style={buttonStyle}>
                  Add Item
                </button>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default BudgetTracker;
