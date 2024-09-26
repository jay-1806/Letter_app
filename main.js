import React, { useState, useEffect } from 'react';
import './main.css'; 
import { jsPDF } from 'jspdf';
import companyLogo from './Companylogo.png';
import emailjs from 'emailjs-com';
const signatureImage = require('./signature.jpeg');

const Main = () => {
  const [sendEmailToHR, setSendEmailToHR] = useState(false);
  const [sendEmailToCandidate, setSendEmailToCandidate] = useState(false);
  const [candidateEmail, setCandidateEmail] = useState('');
  const [hrEmail, setHrEmail] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [placeholders, setPlaceholders] = useState([]);
  const [placeholderValues, setPlaceholderValues] = useState({});
  const [previewContent, setPreviewContent] = useState('');
  const [allPlaceholdersFilledIn, setAllPlaceholdersFilledIn] = useState(false);
  const [includeSignature, setIncludeSignature] = useState(false);

  useEffect(() => {
    const allFilled = placeholders.every((placeholder) => placeholderValues[placeholder]);
    setAllPlaceholdersFilledIn(allFilled);
  }, [placeholderValues, placeholders]);

  useEffect(() => {
    emailjs.init("VSSt7LGDTwTGlCHei");
  }, []);

  const sendEmail = async (toEmail, content) => {
    try {
      const result = await emailjs.send(
        "service_8epwhwa",
        "template_iwdmvv8",
        {
          to_email: toEmail,
          message: content,
        }
      );
      console.log("Email sent successfully:", result.text);
      return { success: true, message: "Email sent successfully" };
    } catch (error) {
      console.error("Error sending email:", error);
      return { success: false, message: "Failed to send email: " + error.text };
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      setFileContent(content);

      const regex = /{{([^{}]+)}}/g;
      const foundPlaceholders = content.match(regex);
      const uniquePlaceholders = foundPlaceholders ? [...new Set(foundPlaceholders.map((placeholder) => placeholder.replace(/[{}]/g, '')))] : [];
      setPlaceholders(uniquePlaceholders);

      const initialValues = {};
      uniquePlaceholders.forEach((placeholder) => {
        initialValues[placeholder] = '';
      });
      setPlaceholderValues(initialValues);
      setPreviewContent('');
    };
    reader.readAsText(file);
  };

  const handleInputChange = (e, placeholder) => {
    const value = e.target.value;
    setPlaceholderValues((prevValues) => ({ ...prevValues, [placeholder]: value }));
  };

  const updatePreviewContent = () => {
    let updatedContent = fileContent;
    Object.entries(placeholderValues).forEach(([placeholder, value]) => {
      const regex = new RegExp(`{{${placeholder}}}`, 'g');
      updatedContent = updatedContent.replace(regex, value);
    });
    setPreviewContent(updatedContent);
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const logoWidth = 200; 
    const logoHeight = 30; 
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const logoX = (pageWidth - logoWidth) / 2; 
    const logoY = 10;
    const margin = 20;
    const contentWidth = pageWidth - 2 * margin;

    doc.addImage(companyLogo, 'PNG', logoX, logoY, logoWidth, logoHeight);
    doc.setFontSize(12); 
    doc.setFont("helvetica"); 

    let y = logoY + logoHeight + 20; 
    const lineHeight = 7;
    
    const addWrappedText = (text, x, y, maxWidth, lineHeight) => {
      const lines = doc.splitTextToSize(text, maxWidth);
      lines.forEach(line => {
        if (y > pageHeight - margin) { 
          doc.addPage();
          y = margin; 
        }
        doc.text(line, x, y);
        y += lineHeight;
      });
      return y;
    };

    const paragraphs = previewContent.split('\n\n');
    paragraphs.forEach(paragraph => {
      y = addWrappedText(paragraph, margin, y, contentWidth, lineHeight) + 5;
    });
    
    if (includeSignature) {
      const signatureWidth = 50;
      const signatureHeight = 25;
      const signatureX = pageWidth - margin - signatureWidth;
      const signatureY = y + 10;

      doc.addImage(signatureImage, 'JPEG', signatureX, signatureY, signatureWidth, signatureHeight);
    }

    // Add footer
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("© 2024 Hirademy Technologies. All rights reserved.", margin, pageHeight - 10);
    
    return doc;
  };

  const downloadTemplate = () => {
    const doc = generatePDF();
    doc.save('template.pdf');
  };

  const handleSendEmail = async () => {
    let results = [];

    if (sendEmailToHR && hrEmail) {
      const result = await sendEmail(hrEmail, previewContent);
      results.push({ to: "HR", ...result });
    }

    if (sendEmailToCandidate && candidateEmail) {
      const result = await sendEmail(candidateEmail, previewContent);
      results.push({ to: "Candidate", ...result });
    }

    // Display results to the user
    const resultMessages = results.map(r => `${r.to}: ${r.message}`).join('\n');
    alert(resultMessages || "No emails were sent. Please check your settings.");
  };

  return (
    <div className="file-upload-container">
      <div className="header-container">
        <input type="file" onChange={handleFileChange} />
      </div>
      {fileContent && (
        <div className="content-container">
          <div className="placeholder-inputs">
            <h2 className="file-content">Enter Placeholder Values:</h2>
            <form>
              {placeholders.map((placeholder, index) => (
                <div key={index} className="placeholder-input">
                  <label htmlFor={placeholder}>{placeholder}</label>
                  <input
                    type="text"
                    id={placeholder}
                    value={placeholderValues[placeholder]}
                    onChange={(e) => handleInputChange(e, placeholder)}
                  />
                </div>
              ))}
            </form>
            <div className="email-options">
              <label>
                <input
                  type="checkbox"
                  checked={sendEmailToHR}
                  onChange={(e) => setSendEmailToHR(e.target.checked)}
                />
                Send to HR
              </label>
              {sendEmailToHR && (
                <input
                  type="email"
                  placeholder="HR Email"
                  value={hrEmail}
                  onChange={(e) => setHrEmail(e.target.value)}
                />
              )}
              <label>
                <input
                  type="checkbox"
                  checked={sendEmailToCandidate}
                  onChange={(e) => setSendEmailToCandidate(e.target.checked)}
                />
                Send to Candidate
              </label>
              {sendEmailToCandidate && (
                <input
                  type="email"
                  placeholder="Candidate Email"
                  value={candidateEmail}
                  onChange={(e) => setCandidateEmail(e.target.value)}
                />
              )}
            </div>
          </div>
          <div className="preview-actions">
            {allPlaceholdersFilledIn && (
              <>
                <button type="button" className="block" onClick={updatePreviewContent}>
                  Show Preview
                </button>
                {previewContent && (
                  <div>
                    <h2 className="file-content">Preview:</h2>
                    <div className="preview-content-container">
                      <pre>{previewContent}</pre>
                    </div>
                    <div className="signature-option">
                      <input
                        type="checkbox"
                        id="includeSignature"
                        checked={includeSignature}
                        onChange={(e) => setIncludeSignature(e.target.checked)}
                      />
                      <label htmlFor="includeSignature"><b>Include Signature</b></label>
                    </div>
                    <button type="button" className="block" onClick={downloadTemplate}>
                      Download Template
                    </button>
                    <button type="button" className="block" onClick={handleSendEmail}>
                      Send Email
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Main;




// import React, { useState, useEffect } from 'react';
// import './main.css'; 
// import { jsPDF } from 'jspdf';
// import companyLogo from './Companylogo.png';
// const signatureImage = require('./signature.jpeg');

// const Main = () => {
//   const [fileContent, setFileContent] = useState('');
//   const [placeholders, setPlaceholders] = useState([]);
//   const [placeholderValues, setPlaceholderValues] = useState({});
//   const [previewContent, setPreviewContent] = useState('');
//   const [allPlaceholdersFilledIn, setAllPlaceholdersFilledIn] = useState(false);
//   const [includeSignature, setIncludeSignature] = useState(false);
//   const [candidateEmail, setCandidateEmail] = useState('');
//   const [hrEmail, setHrEmail] = useState('');
//   const [emailText, setEmailText] = useState('');
//   const [pdfDataUri, setPdfDataUri] = useState('');

//   useEffect(() => {
//     const allFilled = placeholders.every((placeholder) => placeholderValues[placeholder]);
//     setAllPlaceholdersFilledIn(allFilled);
//   }, [placeholderValues, placeholders]);

//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     const reader = new FileReader();
//     reader.onload = (event) => {
//       const content = event.target.result;
//       setFileContent(content);

//       const regex = /{{([^{}]+)}}/g;
//       const foundPlaceholders = content.match(regex);
//       const uniquePlaceholders = foundPlaceholders ? [...new Set(foundPlaceholders.map((placeholder) => placeholder.replace(/[{}]/g, '')))] : [];
//       setPlaceholders(uniquePlaceholders);

//       const initialValues = {};
//       uniquePlaceholders.forEach((placeholder) => {
//         initialValues[placeholder] = '';
//       });
//       setPlaceholderValues(initialValues);
//       setPreviewContent('');
//     };
//     reader.readAsText(file);
//   };

//   const handleInputChange = (e, placeholder) => {
//     const value = e.target.value;
//     setPlaceholderValues((prevValues) => ({ ...prevValues, [placeholder]: value }));
//   };

//   const updatePreviewContent = () => {
//     let updatedContent = fileContent;
//     Object.entries(placeholderValues).forEach(([placeholder, value]) => {
//       const regex = new RegExp(`{{${placeholder}}}`, 'g');
//       updatedContent = updatedContent.replace(regex, value);
//     });
//     setPreviewContent(updatedContent);
//   };

//   const downloadTemplate = () => {
//     const doc = new jsPDF();
//     const logoWidth = 200; 
//     const logoHeight = 30; 
//     const pageWidth = doc.internal.pageSize.getWidth();
//     const pageHeight = doc.internal.pageSize.getHeight();
//     const logoX = (pageWidth - logoWidth) / 2; 
//     const logoY = 10;
//     const margin = 20;
//     const contentWidth = pageWidth - 2 * margin;

//     doc.addImage(companyLogo, 'PNG', logoX, logoY, logoWidth, logoHeight);
//     doc.setFontSize(12); 
//     doc.setFont("helvetica"); 

//     let y = logoY + logoHeight + 20; 
//     const lineHeight = 7;
    
//     const addWrappedText = (text, x, y, maxWidth, lineHeight) => {
//       const lines = doc.splitTextToSize(text, maxWidth);
//       lines.forEach(line => {
//         if (y > pageHeight - margin) { 
//           doc.addPage();
//           y = margin; 
//         }
//         doc.text(line, x, y);
//         y += lineHeight;
//       });
//       return y;
//     };

//     const paragraphs = previewContent.split('\n\n');
//     paragraphs.forEach(paragraph => {
//       y = addWrappedText(paragraph, margin, y, contentWidth, lineHeight) + 5;
//     });

//     if (includeSignature) {
//       const signatureWidth = 50;
//       const signatureHeight = 25;
//       const signatureX = pageWidth - margin - signatureWidth;
//       const signatureY = y + 10;

//       doc.addImage(signatureImage, 'JPEG', signatureX, signatureY, signatureWidth, signatureHeight);
//     }

//     // Add footer
//     doc.setFontSize(10);
//     doc.setTextColor(100);
//     doc.text("© 2024 Hirademy Technologies. All rights reserved.", margin, pageHeight - 10);
    
    
//     doc.save('template.pdf');
//   };

//   const sendEmail = async () => {
//     const response = await fetch(pdfDataUri);
//     const blob = await response.blob();
    
//     const formData = new FormData();
//     formData.append('pdf', blob, 'offer_letter.pdf');
//     formData.append('candidateEmail', candidateEmail);
//     formData.append('hrEmail', hrEmail);
//     formData.append('emailText', emailText);
  
//     try {
//       const response = await fetch('http://localhost:3001/send-email', {
//         method: 'POST',
//         body: formData,
//       });
//       const result = await response.json();
//       alert(result.message); // Show success message
//     } catch (error) {
//       console.error('Error:', error);
//       alert('Failed to send email'); // Show error message
//     }
//   };
  

//   return (
//     <div className="file-upload-container">
//       <div className="header-container">
//         <input type="file" onChange={handleFileChange} />
//       </div>
//       {fileContent && (
//         <div className="content-container">
//           <div className="placeholder-inputs">
//             <h2 className="file-content">Enter Placeholder Values:</h2>
//             <form>
//               {placeholders.map((placeholder, index) => (
//                 <div key={index} className="placeholder-input">
//                   <label htmlFor={placeholder}>{placeholder}</label>
//                   <input
//                     type="text"
//                     id={placeholder}
//                     value={placeholderValues[placeholder]}
//                     onChange={(e) => handleInputChange(e, placeholder)}
//                   />
//                 </div>
//               ))}
//             </form>
//             <input
//               type="email"
//               placeholder="Candidate Email"
//               value={candidateEmail}
//               onChange={(e) => setCandidateEmail(e.target.value)}
//             />
//             <input
//               type="email"
//               placeholder="HR Email"
//               value={hrEmail}
//               onChange={(e) => setHrEmail(e.target.value)}
//             />
//             <textarea
//               placeholder="Email Text"
//               value={emailText}
//               onChange={(e) => setEmailText(e.target.value)}
//             ></textarea>
//           </div>
//           <div className="preview-actions">
//             {allPlaceholdersFilledIn && (
//               <>
//                 <button type="button" className="block" onClick={updatePreviewContent}>
//                   Show Preview
//                 </button>
//                 {previewContent && (
//                   <div>
//                     <h2 className="file-content">Preview:</h2>
//                     <div className="preview-content-container">
//                       <pre>{previewContent}</pre>
//                     </div>
//                     <div className="signature-option">
//                       <input
//                         type="checkbox"
//                         id="includeSignature"
//                         checked={includeSignature}
//                         onChange={(e) => setIncludeSignature(e.target.checked)}
//                       />
//                       <label htmlFor="includeSignature"><b>Include Signature</b></label>
//                     </div>
//                     <button type="button" className="block" onClick={downloadTemplate}>
//                       Download Template
//                     </button>
//                     <button type="button" className="block" onClick={sendEmail}>
//                       Send Email
//                     </button>
//                   </div>
//                 )}
//               </>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Main;
