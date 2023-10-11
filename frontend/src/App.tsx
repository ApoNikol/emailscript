import React, { useState, useEffect } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [formData, setFormData] = useState({
    senderEmail: '',
    password: '',
    subject: '',
    body: '',
    recipientEmail: '',
    attachment: null as string | null, // Explicitly define the type as string | null
  });
  

  const [theme, setTheme] = useState('light'); // Default to light theme

  // Add a class to the body element to apply the selected theme
  useEffect(() => {
    document.body.className = `theme-${theme}`;
  }, [theme]);

  const [savedRecipients, setSavedRecipients] = useState<string[]>([]);

  // Load saved recipients from localStorage when the component mounts
  useEffect(() => {
    const savedRecipientsFromStorage =
      JSON.parse(localStorage.getItem('savedRecipients') || '[]') as string[];
    setSavedRecipients(savedRecipientsFromStorage);
  }, []);

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (file) {
      // Read the selected file and encode it as base64
      const reader = new FileReader();

      reader.onload = (e) => {
        const base64Content = e.target?.result as string;
        setFormData({ ...formData, attachment: base64Content });
      };

      reader.readAsDataURL(file);
    }
  }

  function isEmailValid(email: string) {
    // Use a regular expression to validate the email format
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailPattern.test(email);
  }

  function handleSaveRecipient() {
    const { recipientEmail } = formData;

    if (!isEmailValid(recipientEmail)) {
      alert('Please enter a valid email address.');
      return;
    }

    if (savedRecipients.includes(recipientEmail)) {
      alert('This email is already saved.');
      return;
    }

    const updatedRecipients = [...savedRecipients, recipientEmail];
    setSavedRecipients(updatedRecipients);
    setFormData({ ...formData, recipientEmail: '' });

    // Update localStorage with the updated recipients
    localStorage.setItem('savedRecipients', JSON.stringify(updatedRecipients));
  }

  function handleDeleteRecipient(index: number) {
    const updatedRecipients = [...savedRecipients];
    updatedRecipients.splice(index, 1); // Remove the recipient at the specified index
    setSavedRecipients(updatedRecipients);

    // Update localStorage with the updated recipients
    localStorage.setItem('savedRecipients', JSON.stringify(updatedRecipients));
  }

  function handleSendToSavedRecipients() {
    const { senderEmail, password, subject, body, attachment } = formData;

    savedRecipients.forEach((recipient) => {
      const emailData = {
        senderEmail,
        password,
        subject,
        body: `<p>${body}</p><img src="${attachment}" alt="Embedded Image" />`, // Embed the image using base64 content
        recipientEmail: recipient,
      };

      // Send a POST request to the backend route for each recipient
      fetch('http://localhost:3001/send-email', {
        method: 'POST',
        body: JSON.stringify(emailData),
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(`Email sent to ${recipient}:`, data.message);
          // Handle the response as needed
        })
        .catch((error) => {
          console.error(`Error sending email to ${recipient}:`, error);
        });
    });
  }

  function handleRecipientEmailKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      handleSaveRecipient();
    }
  }

  return (
    <div className="All">
      <button className="btn btn-primary" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
        Toggle Dark Mode
      </button>
      <h1 className="top">Fill in the blank spaces:</h1>
      <div id="main-email">
        <div>
          <label htmlFor="senderEmail">Your Email:</label>
          <input
            type="text"
            name="senderEmail"
            value={formData.senderEmail}
            onChange={handleInputChange}
            placeholder="e.g your-email@gmail.com"
          />
        </div>
        <div>
          <label htmlFor="password">Your Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Your Gmail password"
          />
        </div>
        <div>
          <label htmlFor="subject">Type the subject:</label>
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleInputChange}
            placeholder="e.g Good morning"
          />
        </div>
        <div>
          <label htmlFor="body">Type the body:</label>
          <input
            type="text"
            name="body"
            value={formData.body}
            onChange={handleInputChange}
            placeholder="e.g It is a very nice day to enjoy the weather!"
          />
        </div>
        <div>
          <label htmlFor="attachment">Attach Image:</label>
          <input
            type="file"
            name="attachment"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>
        <div>
          <label htmlFor="recipientEmail">Type recipient's email:</label>
          <input
            type="text"
            name="recipientEmail"
            onKeyDown={handleRecipientEmailKeyDown}
            value={formData.recipientEmail}
            onChange={handleInputChange}
            placeholder="e.g someone@example.com"
          />
          <button className="btn btn-primary" onClick={handleSaveRecipient}>
            Save Recipient
          </button>
        </div>

        {/* Display saved recipients */}
        <div>
          <h3>Saved Recipients:</h3>
          <ul>
            {savedRecipients.map((recipient, index) => (
              <li key={index}>
                {recipient}
                <button onClick={() => handleDeleteRecipient(index)} className="delete-button">
                  X
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <button className="btn btn-primary" onClick={handleSendToSavedRecipients}>
        Send to Saved Recipients
      </button>
    </div>
  );
}

export default App;
