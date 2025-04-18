




// 2nd experimental code 



import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import path from 'path';
const app = express();
import { v2 as cloudinary } from 'cloudinary';

// Configuration
cloudinary.config({
  cloud_name: 'degdokyds',
  api_key: '812166696765979',
  api_secret: "s3ZYxCHtKMUBU53xN7ZbpnkKle4",
});

// Database connection
mongoose.connect("mongodb://localhost:27017/ATSDATA")
  .then(() => {
    console.log("Congratulations MongoDB Connected Succesfully.....!")
  })
  .catch((err) => {
    console.log(err);
  })

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Render login file
app.get('/', (req, res) => {
  res.render('login.ejs', { url: null })
})

// Render register file
app.get('/register', (req, res) => {
  res.render('register.ejs', { url: null })
})

const storage = multer.diskStorage({
  destination: './public/upload',
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix)
  }
})

const upload = multer({ storage: storage })

//SCHEMAA TO SAVE NECESSARY INFO ABOUT FILE..
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  filename: String,
  public_id: String,
  imgUrl: String,
});

const User = mongoose.model("user", userSchema)

// Upload file
app.post('/register', upload.none(), async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const db = await User.create({ name, email, password });
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).send("Error registering user");
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  let user = await User.findOne({ email })
  if (!user) {
    res.render('login.ejs')
  } else if (user.password != password) {
    res.render('login.ejs')
  } else {
    res.render('imageupload.ejs', { user })
  }
})

app.post('/imageupload', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const cloudinaryRes = await cloudinary.uploader.upload(file.path, { folder: "ATSMaster" });
    //save to database
    const db = await User.updateOne({}, {
      $set: {
        filename: file.originalname,
        public_id: cloudinaryRes.public_id,
        imgUrl: cloudinaryRes.secure_url,
      }
    });
    res.json("Your file is uploaded")
    console.log("File uploaded !")
  } catch (error) {
    console.error(error);
    res.status(500).send("Error uploading file");
  }
});

const port = 2000;
app.listen(port, () => {
  console.log(`Server is listening on the port ${port}`)
})



