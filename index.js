// require the firebase-functions package for deployment
const express = require('express');
const admin = require('firebase-admin');

const app = express();

// Initialize the Firebase Admin SDK with your project credentials
const serviceAccount = require('./testingdatabase-3d8ff-firebase-adminsdk-jp5l2-2f63ddcad6.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'testingdatabase-3d8ff.appspot.com'
});

// Create a Firestore database reference
const db = admin.firestore();

// Create a new collection reference
const collectionName = "myNewCollection";
const collectionRef = db.collection(collectionName);





// Create a new document in the collection
app.use('/createCollection', (req, res) => {
  console.log('Creating collection...')

  // use add to auto generate an ID
  // use set to specify an ID
  // db.collection(collectionName).deoc(idname).set({

  db.collection(collectionName).add({
    name: 'John Doe',
    age: 30
  })
    .then(() => {
      res.send('Collection created successfully');
    })
    .catch(error => {
      console.error('Error creating collection:', error);
      res.status(500).send('Error creating collection');
    });
});







// delete the collection
app.use('/deleteCollection', async (req, res) => {

  const batchSize = 10;

  try {
    // Delete documents in batches to avoid out-of-memory errors
    while (true) {
      const querySnapshot = await collectionRef.orderBy('__name__').limit(batchSize).get();
      // When there are no documents left, we are done
      if (querySnapshot.size === 0) {
        break;
      }

      // Delete documents in the current batch
      const batch = db.batch();
      querySnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();
    }

    // Delete the collection itself
    await collectionRef.doc().delete();
    res.send(`Collection ${collectionName} deleted successfully`);
  } catch (error) {
    console.error('Error deleting collection:', error);
    res.status(500).send('Error deleting collection');
  }
});






// collection data list
app.use('/deleteCollectionByid', async (req, res) => {
  var docData = [];
  collectionRef.get()
    .then(e => {
      e.forEach(doc => {
        docData.push(doc.id);
        console.log(doc.id, '=>', doc.data());
        console.log(docData)
      });

      // collection data particular delete
      collectionRef.doc(docData[0]).delete()

        .then(() => {
          res.send('Document deleted successfully');
        })
    })
    .catch((error) => {
      console.error('Error deleting document:', error);
    });
});








// update any document data
app.use('/updateByid', async (req, res) => {

  // Update an existing document in the collection
  // "FHZS3Q0ZMF8EqNsAfH02" is the ID of the document to update

  const existingDocRef = collectionRef.doc("FHZS3Q0ZMF8EqNsAfH02");
  const updatedDocData = {
    name: 'Updated Name',
    age: 35
  };

  existingDocRef.set(updatedDocData, { merge: true })
    .then(() => {
      res.send('Document updated successfully');
    })
    .catch(error => {
      res.send('Error updating document:', error);
      console.log('Error updating document:', error);
    });
});





// add new document data
app.use('/addDocument', async (req, res) => {
  const newDocRef = collectionRef.doc();
  const newDocData = {
    name: 'Jane Doe',
    age: 25
  };

  newDocRef.set(newDocData)
    .then(() => {
      console.log('New document added successfully');
      res.send('New document added successfully');
    })
    .catch(error => {
      console.error('Error adding new document:', error);
      res.send('Error adding new document:', error);
    });

});





// add new document data by id
app.use('/addByid', async (req, res) => {
  try {
    const documentRef = db.collection(collectionName).doc("FHZS3Q0ZMF8EqNsAfH02");
    await documentRef.set({
      name: "aryan",

      // set merge to true to only update the provided fields instead of overwriting the entire document
      // }); 
      // use above to overwrite the entire document

    }, { merge: true });
    res.send(`Data added to document ${"FHZS3Q0ZMF8EqNsAfH02"} in collection ${collectionName} successfully`);
  } catch (error) {
    console.error('Error adding data:', error);
    res.status(500).send('Error adding data');
  }
});





// upload image
// upload image
app.use('/uploadImage', async (req, res) => {
  try {
    const bucket = admin.storage().bucket();

    // Function to upload a file to Cloud Storage
    async function uploadFileToStorage(filePath, destinationPath) {
      await bucket.upload(filePath, {
        destination: destinationPath,
        metadata: {
          contentType: 'image/jpeg', // Change to the content type of your file
        },
      });

      console.log(`${filePath} uploaded to ${destinationPath}.`);
    }

    // Call the uploadFileToStorage function
    await uploadFileToStorage('./image/pic-min.jpg', 'images/image.jpg');
    
    const options = {
      version: 'v4',
      action: 'read',
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
    };
    
    // Get a signed URL for the file
    const [url] = await bucket.file('./image/image.jpg').getSignedUrl(options);
    
    console.log(`The signed URL for the file is: ${url}`);

    res.send('Image uploaded successfully');
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).send('Error uploading image');
  }
});

// react part to view image

// import React, { useState, useEffect } from 'react';

// function App() {
//   const [imageUrl, setImageUrl] = useState('');

//   useEffect(() => {
//     async function getImageUrl() {
//       const response = await fetch('<SIGNED_URL>');
//       const blob = await response.blob();
//       const url = URL.createObjectURL(blob);
//       setImageUrl(url);
//     }
//     getImageUrl();
//   }, []);

//   return (
//     <div>
//       {imageUrl && <img src={imageUrl} alt="Uploaded image" />}
//     </div>
//   );
// }

// generate all images url
// // Get a reference to the bucket
// const bucket = admin.storage().bucket();

// // Function to upload a file to Cloud Storage
// async function uploadFileToStorage(filePath, destinationPath) {
//   await bucket.upload(filePath, {
//     destination: destinationPath,
//     metadata: {
//       contentType: 'image/jpeg', // Change to the content type of your file
//     },
//   });

//   console.log(`${filePath} uploaded to ${destinationPath}.`);
// }

// // Get a list of files from the bucket
// async function listFiles() {
//   // Limit the list to 1000 files
//   const [files] = await bucket.getFiles({ maxResults: 1000 });

//   // Generate signed URLs for each file
//   const urls = await Promise.all(
//     files.map(async (file) => {
//       const [url] = await file.getSignedUrl({
//         version: 'v4',
//         action: 'read',
//         expires: Date.now() + 15 * 60 * 1000, // 15 minutes
//       });
//       return url;
//     })
//   );

//   return urls;
// }

// // Route to upload and list images
// app.use('/images', async (req, res) => {
//   try {
//     // Upload the file
//     await uploadFileToStorage('./image/pic-min.jpg', 'images/image.jpg');

//     // Get the list of files and signed URLs
//     const urls = await listFiles();

//     // Send the URLs in the response
//     res.send(urls);
//   } catch (error) {
//     console.error('Error uploading image:', error);
//     res.status(500).send('Error uploading image');
//   }
// });







// Start the Express app
app.listen(3000, () => {
  console.log('App listening on port 3000');
});
