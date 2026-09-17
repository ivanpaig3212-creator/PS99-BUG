import java.awt.*;
import java.awt.event.ActionEvent;
import java.text.DecimalFormat;
import java.util.LinkedHashMap;
import java.util.Map;
import javax.swing.*;
import javax.swing.table.DefaultTableModel;

public class Franco extends JFrame {

    // =========================
    // PRODUCT CLASS
    // =========================

    static class Product {
        String name;
        double price;

        Product(String name, double price) {
            this.name = name;
            this.price = price;
        }

        @Override
        public String toString() {
            return name + " - ₱" + String.format("%.2f", price);
        }
    }

    // =========================
    // VARIABLES
    // =========================

    private final Map<String, Product> products = new LinkedHashMap<>();

    private JComboBox<Product> productComboBox;
    private JSpinner quantitySpinner;

    private DefaultTableModel tableModel;
    private JTable cartTable;

    private JLabel subtotalLabel;
    private JLabel taxLabel;
    private JLabel totalLabel;
    private JLabel changeLabel;

    private JTextField paymentField;

    private static final double TAX_RATE = 0.12;

    private final DecimalFormat moneyFormat =
            new DecimalFormat("₱#,##0.00");

    // =========================
    // CONSTRUCTOR
    // =========================

    public Franco() {

        // Add products
        products.put("Burger",
                new Product("Burger", 75.00));

        products.put("French Fries",
                new Product("French Fries", 50.00));

        products.put("Pizza",
                new Product("Pizza", 250.00));

        products.put("Fried Chicken",
                new Product("Fried Chicken", 120.00));

        products.put("Soft Drink",
                new Product("Soft Drink", 35.00));

        products.put("Coffee",
                new Product("Coffee", 60.00));

        products.put("Ice Cream",
                new Product("Ice Cream", 45.00));

        // Window settings
        setTitle("Java Point of Sale System");
        setSize(850, 600);
        setLocationRelativeTo(null);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);

        createGUI();
    }

    // =========================
    // CREATE GUI
    // =========================

    private void createGUI() {

        JPanel mainPanel =
                new JPanel(new BorderLayout(10, 10));

        mainPanel.setBorder(
                BorderFactory.createEmptyBorder(
                        10, 10, 10, 10
                )
        );

        // =========================
        // PRODUCT PANEL
        // =========================

        JPanel productPanel =
                new JPanel(new FlowLayout(FlowLayout.LEFT));

        productPanel.setBorder(
                BorderFactory.createTitledBorder(
                        "Select Product"
                )
        );

        productComboBox =
                new JComboBox<>(
                        products.values().toArray(
                                new Product[0]
                        )
                );

        quantitySpinner =
                new JSpinner(
                        new SpinnerNumberModel(
                                1, 1, 100, 1
                        )
                );

        JButton addButton =
                new JButton("Add to Cart");

        productPanel.add(
                new JLabel("Product:")
        );

        productPanel.add(
                productComboBox
        );

        productPanel.add(
                new JLabel("Quantity:")
        );

        productPanel.add(
                quantitySpinner
        );

        productPanel.add(
                addButton
        );

        mainPanel.add(
                productPanel,
                BorderLayout.NORTH
        );

        // =========================
        // CART TABLE
        // =========================

        String[] columns = {
                "Product",
                "Price",
                "Quantity",
                "Total"
        };

        tableModel =
                new DefaultTableModel(columns, 0) {

                    @Override
                    public boolean isCellEditable(
                            int row,
                            int column
                    ) {
                        return false;
                    }
                };

        cartTable =
                new JTable(tableModel);

        cartTable.setRowHeight(25);

        JScrollPane scrollPane =
                new JScrollPane(cartTable);

        mainPanel.add(
                scrollPane,
                BorderLayout.CENTER
        );

        // =========================
        // BOTTOM PANEL
        // =========================

        JPanel bottomPanel =
                new JPanel(
                        new BorderLayout(10, 10)
                );

        // =========================
        // BUTTONS
        // =========================

        JPanel buttonPanel =
                new JPanel(
                        new FlowLayout(FlowLayout.LEFT)
                );

        JButton removeButton =
                new JButton("Remove Selected");

        JButton clearButton =
                new JButton("Clear Cart");

        JButton checkoutButton =
                new JButton("Checkout");

        buttonPanel.add(removeButton);
        buttonPanel.add(clearButton);
        buttonPanel.add(checkoutButton);

        bottomPanel.add(
                buttonPanel,
                BorderLayout.NORTH
        );

        // =========================
        // PAYMENT PANEL
        // =========================

        JPanel paymentPanel =
                new JPanel(
                        new GridLayout(5, 2, 10, 5)
                );

        paymentPanel.setBorder(
                BorderFactory.createTitledBorder(
                        "Payment"
                )
        );

        subtotalLabel =
                new JLabel("₱0.00");

        taxLabel =
                new JLabel("₱0.00");

        totalLabel =
                new JLabel("₱0.00");

        paymentField =
                new JTextField();

        changeLabel =
                new JLabel("₱0.00");

        paymentPanel.add(
                new JLabel("Subtotal:")
        );

        paymentPanel.add(
                subtotalLabel
        );

        paymentPanel.add(
                new JLabel("Tax (12%):")
        );

        paymentPanel.add(
                taxLabel
        );

        paymentPanel.add(
                new JLabel("Total:")
        );

        paymentPanel.add(
                totalLabel
        );

        paymentPanel.add(
                new JLabel("Payment:")
        );

        paymentPanel.add(
                paymentField
        );

        paymentPanel.add(
                new JLabel("Change:")
        );

        paymentPanel.add(
                changeLabel
        );

        bottomPanel.add(
                paymentPanel,
                BorderLayout.CENTER
        );

        mainPanel.add(
                bottomPanel,
                BorderLayout.SOUTH
        );

        add(mainPanel);

        // =========================
        // BUTTON ACTIONS
        // =========================

        addButton.addActionListener(
                this::addProduct
        );

        removeButton.addActionListener(
                e -> removeSelectedProduct()
        );

        clearButton.addActionListener(
                e -> clearCart()
        );

        checkoutButton.addActionListener(
                e -> checkout()
        );

        paymentField.addActionListener(
                e -> calculateChange()
        );
    }

    // =========================
    // ADD PRODUCT
    // =========================

    private void addProduct(ActionEvent e) {

        Product product =
                (Product) productComboBox.getSelectedItem();

        if (product == null) {
            return;
        }

        int quantity =
                (Integer) quantitySpinner.getValue();

        double itemTotal =
                product.price * quantity;

        tableModel.addRow(
                new Object[]{
                        product.name,
                        moneyFormat.format(product.price),
                        quantity,
                        moneyFormat.format(itemTotal)
                }
        );

        updateTotals();
    }

    // =========================
    // REMOVE PRODUCT
    // =========================

    private void removeSelectedProduct() {

        int selectedRow =
                cartTable.getSelectedRow();

        if (selectedRow == -1) {

            JOptionPane.showMessageDialog(
                    this,
                    "Please select an item to remove.",
                    "No Item Selected",
                    JOptionPane.WARNING_MESSAGE
            );

            return;
        }

        tableModel.removeRow(selectedRow);

        updateTotals();
    }

    // =========================
    // CLEAR CART
    // =========================

    private void clearCart() {

        int choice =
                JOptionPane.showConfirmDialog(
                        this,
                        "Are you sure you want to clear the cart?",
                        "Clear Cart",
                        JOptionPane.YES_NO_OPTION
                );

        if (choice == JOptionPane.YES_OPTION) {

            tableModel.setRowCount(0);

            paymentField.setText("");

            changeLabel.setText("₱0.00");
            changeLabel.setForeground(Color.BLACK);

            updateTotals();
        }
    }

    // =========================
    // UPDATE TOTALS
    // =========================

    private void updateTotals() {

        double subtotal = 0;

        for (int row = 0;
             row < tableModel.getRowCount();
             row++) {

            String totalText =
                    tableModel
                            .getValueAt(row, 3)
                            .toString();

            totalText =
                    totalText
                            .replace("₱", "")
                            .replace(",", "");

            try {
                subtotal += Double.parseDouble(totalText);
            } catch (NumberFormatException ex) {
                // Ignore invalid table values
            }
        }

        double tax =
                subtotal * TAX_RATE;

        double total =
                subtotal + tax;

        subtotalLabel.setText(
                moneyFormat.format(subtotal)
        );

        taxLabel.setText(
                moneyFormat.format(tax)
        );

        totalLabel.setText(
                moneyFormat.format(total)
        );

        calculateChange();
    }

    // =========================
    // CALCULATE CHANGE
    // =========================

    private void calculateChange() {

        String paymentText =
                paymentField.getText().trim();

        if (paymentText.isEmpty()) {

            changeLabel.setText("₱0.00");
            changeLabel.setForeground(Color.BLACK);

            return;
        }

        try {

            double payment =
                    Double.parseDouble(paymentText);

            double total =
                    getTotal();

            double change =
                    payment - total;

            if (change < 0) {

                changeLabel.setText(
                        "Insufficient"
                );

                changeLabel.setForeground(
                        Color.RED
                );

            } else {

                changeLabel.setText(
                        moneyFormat.format(change)
                );

                changeLabel.setForeground(
                        Color.BLACK
                );
            }

        } catch (NumberFormatException ex) {

            changeLabel.setText("Invalid");

            changeLabel.setForeground(
                    Color.RED
            );
        }
    }

    // =========================
    // GET TOTAL
    // =========================

    private double getTotal() {

        String totalText =
                totalLabel.getText();

        totalText =
                totalText
                        .replace("₱", "")
                        .replace(",", "");

        try {

            return Double.parseDouble(
                    totalText
            );

        } catch (NumberFormatException e) {

            return 0.0;
        }
    }

    // =========================
    // CHECKOUT
    // =========================

    private void checkout() {

        if (tableModel.getRowCount() == 0) {

            JOptionPane.showMessageDialog(
                    this,
                    "The cart is empty.",
                    "Checkout",
                    JOptionPane.WARNING_MESSAGE
            );

            return;
        }

        String paymentText =
                paymentField.getText().trim();

        if (paymentText.isEmpty()) {

            JOptionPane.showMessageDialog(
                    this,
                    "Please enter the payment amount.",
                    "Payment Required",
                    JOptionPane.WARNING_MESSAGE
            );

            return;
        }

        try {

            double payment =
                    Double.parseDouble(paymentText);

            if (payment < 0) {

                JOptionPane.showMessageDialog(
                        this,
                        "Payment cannot be negative.",
                        "Invalid Payment",
                        JOptionPane.ERROR_MESSAGE
                );

                return;
            }

            double total =
                    getTotal();

            if (payment < total) {

                JOptionPane.showMessageDialog(
                        this,
                        "Insufficient payment.\n"
                                + "Required: "
                                + moneyFormat.format(total)
                                + "\nPaid: "
                                + moneyFormat.format(payment),
                        "Insufficient Payment",
                        JOptionPane.ERROR_MESSAGE
                );

                return;
            }

            double change =
                    payment - total;

            StringBuilder receipt =
                    new StringBuilder();

            receipt.append(
                    "========== RECEIPT ==========\n\n"
            );

            for (int row = 0;
                 row < tableModel.getRowCount();
                 row++) {

                String product =
                        tableModel
                                .getValueAt(row, 0)
                                .toString();

                String quantity =
                        tableModel
                                .getValueAt(row, 2)
                                .toString();

                String itemTotal =
                        tableModel
                                .getValueAt(row, 3)
                                .toString();

                receipt.append(product)
                        .append(" x ")
                        .append(quantity)
                        .append(" = ")
                        .append(itemTotal)
                        .append("\n");
            }

            receipt.append(
                    "\n-----------------------------\n"
            );

            receipt.append("Subtotal: ")
                    .append(subtotalLabel.getText())
                    .append("\n");

            receipt.append("Tax: ")
                    .append(taxLabel.getText())
                    .append("\n");

            receipt.append("Total: ")
                    .append(totalLabel.getText())
                    .append("\n");

            receipt.append("Payment: ")
                    .append(moneyFormat.format(payment))
                    .append("\n");

            receipt.append("Change: ")
                    .append(moneyFormat.format(change));

            receipt.append(
                    "\n\nThank you for your purchase!"
            );

            JOptionPane.showMessageDialog(
                    this,
                    receipt.toString(),
                    "Transaction Complete",
                    JOptionPane.INFORMATION_MESSAGE
            );

            // Clear transaction
            tableModel.setRowCount(0);

            paymentField.setText("");

            changeLabel.setText("₱0.00");
            changeLabel.setForeground(Color.BLACK);

            updateTotals();

        } catch (NumberFormatException ex) {

            JOptionPane.showMessageDialog(
                    this,
                    "Please enter a valid payment amount.",
                    "Invalid Payment",
                    JOptionPane.ERROR_MESSAGE
            );
        }
    }

    // =========================
    // MAIN METHOD
    // =========================

    public static void main(String[] args) {

        SwingUtilities.invokeLater(() -> {

            try {

                UIManager.setLookAndFeel(
                        UIManager
                                .getSystemLookAndFeelClassName()
                );

            } catch (Exception ignored) {
                // Use default Look and Feel
            }

            Franco app = new Franco();
            app.setVisible(true);
        });
    }
}