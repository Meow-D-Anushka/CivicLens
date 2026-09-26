import multer from 'multer';

// memoryStorage keeps the file as a Buffer on req.file.buffer instead of
// writing to disk — important on serverless hosts (Vercel) where the
// filesystem is read-only/ephemeral, and convenient everywhere else since
// we're inserting the bytes straight into Postgres anyway.
const storage = multer.memoryStorage();

function fileFilter(_req, file, cb) {
  if (!file.mimetype.startsWith('image/')) {
    cb(new Error('Only image uploads are allowed.'));
    return;
  }
  cb(null, true);
}

export const uploadPhoto = multer({
  storage,
  fileFilter,
  // Matches the 8MB cap enforced client-side in ReportIssuePage.
  limits: { fileSize: 8 * 1024 * 1024 },
});
