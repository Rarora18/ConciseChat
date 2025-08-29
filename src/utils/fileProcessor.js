// File processing utility for handling various file types
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

// Import PDF.js
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.js';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

// File type detection
const FILE_TYPES = {
  TEXT: ['txt', 'md', 'json', 'xml', 'csv', 'log', 'js', 'ts', 'jsx', 'tsx', 'html', 'css', 'scss', 'py', 'java', 'cpp', 'c', 'php', 'rb', 'go', 'rs', 'swift', 'kt'],
  PDF: ['pdf'],
  WORD: ['docx', 'doc'],
  EXCEL: ['xlsx', 'xls'],
  CSV: ['csv'],
  IMAGE: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'],
  ARCHIVE: ['zip', 'rar', '7z', 'tar', 'gz'],
  CODE: ['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp', 'c', 'php', 'rb', 'go', 'rs', 'swift', 'kt', 'html', 'css', 'scss', 'json', 'xml']
};

// Get file extension
function getFileExtension(filename) {
  return filename.split('.').pop().toLowerCase();
}

// Check if file type is supported
function isFileTypeSupported(filename) {
  const ext = getFileExtension(filename);
  return Object.values(FILE_TYPES).flat().includes(ext);
}

// Process text files
async function processTextFile(file) {
  try {
    const text = await file.text();
    return {
      success: true,
      content: text,
      type: 'text',
      wordCount: text.split(/\s+/).length,
      charCount: text.length
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to read text file: ${error.message}`,
      type: 'text'
    };
  }
}

// Process PDF files
async function processPDFFile(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = '';
    const pageCount = pdf.numPages;
    
    // Extract text from each page
    for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += `Page ${pageNum}:\n${pageText}\n\n`;
    }
    
    return {
      success: true,
      content: fullText.trim(),
      type: 'pdf',
      pageCount,
      wordCount: fullText.split(/\s+/).length,
      charCount: fullText.length
    };
  } catch (error) {
    console.error('PDF processing error:', error);
    
    // Fallback: provide helpful information about the PDF
    return {
      success: false,
      error: `PDF processing failed: ${error.message}. This might be due to a corrupted PDF, password protection, or browser compatibility issues. Please try with a different PDF file or contact support if the issue persists.`,
      type: 'pdf',
      fallbackContent: `[PDF file: ${file.name}]\nSize: ${(file.size / 1024).toFixed(1)}KB\nType: ${file.type}\n\nNote: Unable to extract text from this PDF. This could be due to:\n- Password protection\n- Corrupted file\n- Browser compatibility issues\n- PDF contains only images/scanned content\n\nPlease try with a different PDF or describe what you need help with regarding this document.`
    };
  }
}

// Process Word documents
async function processWordFile(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    
    return {
      success: true,
      content: result.value,
      type: 'word',
      wordCount: result.value.split(/\s+/).length,
      charCount: result.value.length,
      messages: result.messages
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to read Word document: ${error.message}`,
      type: 'word'
    };
  }
}

// Process Excel files
async function processExcelFile(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    let content = '';
    const sheetNames = workbook.SheetNames;
    
    sheetNames.forEach((sheetName, index) => {
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      content += `Sheet: ${sheetName}\n`;
      content += `Rows: ${jsonData.length}\n`;
      content += `Data:\n`;
      
      // Add first few rows as preview
      const previewRows = jsonData.slice(0, 10);
      previewRows.forEach((row, rowIndex) => {
        content += `Row ${rowIndex + 1}: ${JSON.stringify(row)}\n`;
      });
      
      if (jsonData.length > 10) {
        content += `... and ${jsonData.length - 10} more rows\n`;
      }
      content += '\n';
    });
    
    return {
      success: true,
      content: content.trim(),
      type: 'excel',
      sheetCount: sheetNames.length,
      totalRows: sheetNames.reduce((total, sheetName) => {
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        return total + jsonData.length;
      }, 0)
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to read Excel file: ${error.message}`,
      type: 'excel'
    };
  }
}

// Process CSV files
async function processCSVFile(file) {
  try {
    const text = await file.text();
    const result = Papa.parse(text, { header: true });
    
    let content = `CSV Analysis:\n`;
    content += `Total Rows: ${result.data.length}\n`;
    content += `Columns: ${result.meta.fields ? result.meta.fields.join(', ') : 'No headers'}\n\n`;
    
    // Add first few rows as preview
    const previewRows = result.data.slice(0, 10);
    content += `Preview (first ${previewRows.length} rows):\n`;
    previewRows.forEach((row, index) => {
      content += `Row ${index + 1}: ${JSON.stringify(row)}\n`;
    });
    
    if (result.data.length > 10) {
      content += `... and ${result.data.length - 10} more rows\n`;
    }
    
    return {
      success: true,
      content: content.trim(),
      type: 'csv',
      rowCount: result.data.length,
      columnCount: result.meta.fields ? result.meta.fields.length : 0,
      errors: result.errors
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to read CSV file: ${error.message}`,
      type: 'csv'
    };
  }
}

// Process image files
async function processImageFile(file) {
  try {
    // Create a preview URL for the image
    const imageUrl = URL.createObjectURL(file);
    
    return {
      success: true,
      content: `[Image file: ${file.name}]\nSize: ${(file.size / 1024).toFixed(1)}KB\nType: ${file.type}\nDimensions: Unable to determine in browser\n\nNote: This is an image file. I can see the file details but cannot analyze the visual content. Consider describing what you see in the image or asking specific questions about it.`,
      type: 'image',
      imageUrl,
      fileSize: file.size
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to process image file: ${error.message}`,
      type: 'image'
    };
  }
}

// Process archive files
async function processArchiveFile(file) {
  return {
    success: true,
    content: `[Archive file: ${file.name}]\nSize: ${(file.size / 1024).toFixed(1)}KB\nType: ${file.type}\n\nNote: This is an archive file (ZIP, RAR, etc.). I cannot extract or read the contents of archive files directly. Please extract the files and upload them individually if you need me to analyze their contents.`,
    type: 'archive',
    fileSize: file.size
  };
}

// Main file processing function
export async function processFile(file) {
  const ext = getFileExtension(file.name);
  
  // Add file info
  const fileInfo = {
    name: file.name,
    size: file.size,
    type: file.type,
    extension: ext,
    lastModified: file.lastModified
  };
  
  let result;
  
  // Route to appropriate processor based on file type
  if (FILE_TYPES.PDF.includes(ext)) {
    result = await processPDFFile(file);
  } else if (FILE_TYPES.WORD.includes(ext)) {
    result = await processWordFile(file);
  } else if (FILE_TYPES.EXCEL.includes(ext)) {
    result = await processExcelFile(file);
  } else if (FILE_TYPES.CSV.includes(ext)) {
    result = await processCSVFile(file);
  } else if (FILE_TYPES.IMAGE.includes(ext)) {
    result = await processImageFile(file);
  } else if (FILE_TYPES.ARCHIVE.includes(ext)) {
    result = await processArchiveFile(file);
  } else if (FILE_TYPES.TEXT.includes(ext) || file.type.startsWith('text/')) {
    result = await processTextFile(file);
  } else {
    // Unsupported file type
    result = {
      success: false,
      error: `Unsupported file type: ${ext}. Supported types include: ${Object.values(FILE_TYPES).flat().join(', ')}`,
      type: 'unsupported'
    };
  }
  
  return {
    ...result,
    fileInfo
  };
}

// Process multiple files
export async function processFiles(files) {
  const results = [];
  
  for (const file of files) {
    const result = await processFile(file);
    results.push(result);
  }
  
  return results;
}

// Format file processing results for AI
export function formatFileResultsForAI(results) {
  let formattedContent = '';
  
  results.forEach((result, index) => {
    const { fileInfo, success, content, error, type } = result;
    
    formattedContent += `=== File ${index + 1}: ${fileInfo.name} ===\n`;
    formattedContent += `Type: ${type.toUpperCase()}\n`;
    formattedContent += `Size: ${(fileInfo.size / 1024).toFixed(1)}KB\n`;
    
    if (success) {
      formattedContent += `Status: Successfully processed\n`;
      formattedContent += `Content:\n${content}\n`;
      
      // Add additional metadata
      if (result.wordCount) {
        formattedContent += `Word Count: ${result.wordCount}\n`;
      }
      if (result.charCount) {
        formattedContent += `Character Count: ${result.charCount}\n`;
      }
      if (result.pageCount) {
        formattedContent += `Pages: ${result.pageCount}\n`;
      }
      if (result.sheetCount) {
        formattedContent += `Sheets: ${result.sheetCount}\n`;
      }
      if (result.rowCount) {
        formattedContent += `Rows: ${result.rowCount}\n`;
      }
    } else {
      formattedContent += `Status: Failed to process\n`;
      formattedContent += `Error: ${error}\n`;
      
      // Add fallback content if available
      if (result.fallbackContent) {
        formattedContent += `Fallback Information:\n${result.fallbackContent}\n`;
      }
    }
    
    formattedContent += '\n---\n\n';
  });
  
  return formattedContent.trim();
}

// Check if file type is supported
export { isFileTypeSupported, FILE_TYPES };
