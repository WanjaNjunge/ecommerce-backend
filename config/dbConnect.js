const { default: mongoose } =  require("mongoose");

const dbConnect = () => {
    try {
        const conn =  mongoose.connect("mongodb+srv://wnjunge19:gBmyopau0rd8LefZ@ecombe.ve0fh8a.mongodb.net/ecom-API?retryWrites=true&w=majority&appName=EcomBE");
        console.log("Database connected successfully")
    } catch (error) {
        console.log("Database error")
    }
};

module.exports = dbConnect;