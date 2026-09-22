package com.dadi.privatkomisi;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.ContentResolver;
import android.content.ContentValues;
import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Typeface;
import android.graphics.pdf.PdfDocument;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.view.Window;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.text.NumberFormat;
import java.util.Locale;
import java.util.Map;
import java.util.TreeMap;
import java.util.TreeSet;

public class MainActivity extends Activity {
    private WebView webView;

    @SuppressLint({"SetJavaScriptEnabled", "AddJavascriptInterface"})
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Window w = getWindow();
        w.setStatusBarColor(Color.rgb(11, 37, 69));
        w.setNavigationBarColor(Color.WHITE);

        webView = new WebView(this);
        webView.setBackgroundColor(Color.rgb(244, 247, 251));
        webView.getSettings().setJavaScriptEnabled(true);
        webView.getSettings().setDomStorageEnabled(true);
        webView.getSettings().setDatabaseEnabled(true);
        webView.getSettings().setAllowFileAccess(true);
        webView.getSettings().setTextZoom(100);
        webView.setWebViewClient(new WebViewClient());
        webView.addJavascriptInterface(new AndroidBridge(this), "Android");
        setContentView(webView);
        webView.loadUrl("file:///android_asset/index.html");
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) webView.goBack();
        else super.onBackPressed();
    }

    public static class AndroidBridge {
        private final Activity activity;
        private final Context context;

        AndroidBridge(Activity activity) {
            this.activity = activity;
            this.context = activity.getApplicationContext();
        }

        @JavascriptInterface
        public void saveCsv(String fileName, String csv) {
            try {
                OutputStream out = openDownload(fileName, "text/csv");
                out.write(new byte[]{(byte)0xEF, (byte)0xBB, (byte)0xBF});
                out.write(csv.getBytes(StandardCharsets.UTF_8));
                out.flush();
                out.close();
                toast("CSV tersimpan di folder Download/PrivatKomisi");
            } catch (Exception e) {
                toast("Gagal menyimpan CSV: " + e.getMessage());
            }
        }

        @JavascriptInterface
        public void saveInvoicePdf(String fileName, String recipient, String period, String ownerName, String recapTitle, String rowsJson, String totalText) {
            PdfDocument doc = new PdfDocument();
            try {
                JSONArray rows = new JSONArray(rowsJson);
                final int width = 842;
                final int height = 595;
                final int left = 36;
                final int right = 806;
                final int topStart = 38;
                final int rowH = 23;

                TreeMap<String, double[]> byStudent = new TreeMap<>();
                TreeMap<String, double[]> byTeacher = new TreeMap<>();
                TreeMap<String, String[]> teacherBank = new TreeMap<>();
                TreeMap<String, Double> transferAmount = new TreeMap<>();
                TreeMap<String, String[]> transferBank = new TreeMap<>();
                TreeMap<String, TreeSet<String>> transferTeachers = new TreeMap<>();
                for (int i = 0; i < rows.length(); i++) {
                    JSONObject r = rows.getJSONObject(i);
                    String studentName = r.optString("student", "-");
                    String teacherName = r.optString("teacher", "-");
                    double fee = r.optDouble("fee", 0);
                    double[] ss = byStudent.containsKey(studentName) ? byStudent.get(studentName) : new double[]{0, 0};
                    ss[0] += 1; ss[1] += fee; byStudent.put(studentName, ss);
                    double[] tt = byTeacher.containsKey(teacherName) ? byTeacher.get(teacherName) : new double[]{0, 0};
                    tt[0] += 1; tt[1] += fee; byTeacher.put(teacherName, tt);
                    if (!teacherBank.containsKey(teacherName)) {
                        teacherBank.put(teacherName, new String[]{
                            r.optString("teacherBank", ""),
                            r.optString("teacherAccountHolder", teacherName),
                            r.optString("teacherAccountNumber", "")
                        });
                    }

                    String bankName = r.optString("teacherBank", "").trim();
                    String holderName = r.optString("teacherAccountHolder", teacherName).trim();
                    String accountNumber = r.optString("teacherAccountNumber", "").trim();
                    String normalizedAccount = accountNumber.replaceAll("\\s+", "");
                    String transferKey = !normalizedAccount.isEmpty()
                            ? bankName.toLowerCase(Locale.ROOT) + "|" + normalizedAccount
                            : "teacher|" + teacherName.toLowerCase(Locale.ROOT);
                    transferAmount.put(transferKey, transferAmount.containsKey(transferKey)
                            ? transferAmount.get(transferKey) + fee : fee);
                    if (!transferBank.containsKey(transferKey)) {
                        transferBank.put(transferKey, new String[]{bankName, holderName, accountNumber});
                    }
                    if (!transferTeachers.containsKey(transferKey)) {
                        transferTeachers.put(transferKey, new TreeSet<String>());
                    }
                    transferTeachers.get(transferKey).add(teacherName);
                }

                Paint p = new Paint(Paint.ANTI_ALIAS_FLAG);
                p.setColor(Color.rgb(19, 32, 51));
                p.setTypeface(Typeface.create(Typeface.DEFAULT, Typeface.NORMAL));

                int pageNo = 1;
                int rowIndex = 0;

                while (rowIndex < rows.length() || pageNo == 1) {
                    PdfDocument.PageInfo info = new PdfDocument.PageInfo.Builder(width, height, pageNo).create();
                    PdfDocument.Page page = doc.startPage(info);
                    Canvas canvas = page.getCanvas();
                    canvas.drawColor(Color.WHITE);
                    int y = topStart;

                    p.setTypeface(Typeface.create(Typeface.DEFAULT, Typeface.BOLD));
                    p.setTextSize(18);
                    p.setColor(Color.rgb(11, 37, 69));
                    canvas.drawText("TAGIHAN LES PRIVAT", left, y, p);
                    y += 21;
                    p.setTextSize(10.5f);
                    p.setTypeface(Typeface.create(Typeface.DEFAULT, Typeface.NORMAL));
                    p.setColor(Color.rgb(74, 91, 112));
                    if (recipient != null && !recipient.trim().isEmpty()) {
                        canvas.drawText("Kepada: " + recipient.trim(), left, y, p);
                        y += 15;
                    }
                    canvas.drawText("Periode: " + period, left, y, p);
                    y += 15;
                    if (ownerName != null && !ownerName.trim().isEmpty()) {
                        canvas.drawText("Pengelola privat: " + ownerName.trim(), left, y, p);
                        y += 15;
                    }
                    y += 2;
                    p.setColor(Color.rgb(25, 185, 172));
                    canvas.drawRect(left, y, right, y + 3, p);
                    y += 17;

                    p.setColor(Color.rgb(241,245,249));
                    canvas.drawRect(left, y - 14, right, y + 8, p);
                    p.setColor(Color.rgb(50, 65, 85));
                    p.setTypeface(Typeface.create(Typeface.DEFAULT, Typeface.BOLD));
                    p.setTextSize(9.5f);
                    drawCell(canvas, p, "No", 40, y, 25);
                    drawCell(canvas, p, "Tanggal", 76, y, 86);
                    drawCell(canvas, p, "Siswa", 170, y, 205);
                    drawCell(canvas, p, "Pengajar", 382, y, 215);
                    drawCellRight(canvas, p, "Tagihan", 800, y, 122);
                    y += 13;

                    p.setTypeface(Typeface.create(Typeface.DEFAULT, Typeface.NORMAL));
                    p.setTextSize(9.2f);
                    p.setColor(Color.rgb(19, 32, 51));

                    while (rowIndex < rows.length() && y < 525) {
                        JSONObject row = rows.getJSONObject(rowIndex);
                        if (rowIndex % 2 == 1) {
                            p.setColor(Color.rgb(250,252,254));
                            canvas.drawRect(left, y - 12, right, y + 10, p);
                            p.setColor(Color.rgb(19,32,51));
                        }
                        drawCell(canvas, p, String.valueOf(row.optInt("no", rowIndex + 1)), 40, y, 25);
                        drawCell(canvas, p, row.optString("date", ""), 76, y, 86);
                        drawCell(canvas, p, row.optString("student", ""), 170, y, 205);
                        drawCell(canvas, p, row.optString("teacher", ""), 382, y, 215);
                        drawCellRight(canvas, p, rupiah(row.optDouble("fee", 0)), 800, y, 122);
                        p.setColor(Color.rgb(226,232,240));
                        canvas.drawLine(left, y + 10, right, y + 10, p);
                        p.setColor(Color.rgb(19,32,51));
                        y += rowH;
                        rowIndex++;
                    }

                    if (rowIndex >= rows.length()) {
                        int recapNeeded = 175 + byStudent.size() * 18 + byTeacher.size() * 62 + transferAmount.size() * 64;
                        if (y + recapNeeded > 560) {
                            doc.finishPage(page);
                            pageNo++;
                            PdfDocument.PageInfo recapInfo = new PdfDocument.PageInfo.Builder(width, height, pageNo).create();
                            page = doc.startPage(recapInfo);
                            canvas = page.getCanvas();
                            canvas.drawColor(Color.WHITE);
                            y = 46;

                            p.setTypeface(Typeface.create(Typeface.DEFAULT, Typeface.BOLD));
                            p.setTextSize(16);
                            p.setColor(Color.rgb(11, 37, 69));
                            canvas.drawText("REKAP TAGIHAN", left, y, p);
                            y += 19;
                            p.setTypeface(Typeface.create(Typeface.DEFAULT, Typeface.NORMAL));
                            p.setTextSize(9.5f);
                            p.setColor(Color.rgb(74, 91, 112));
                            if (recipient != null && !recipient.trim().isEmpty()) {
                                canvas.drawText("Kepada: " + recipient.trim(), left, y, p);
                                y += 14;
                            }
                            canvas.drawText("Periode: " + period, left, y, p);
                            y += 14;
                            if (ownerName != null && !ownerName.trim().isEmpty()) {
                                canvas.drawText("Pengelola privat: " + ownerName.trim(), left, y, p);
                                y += 14;
                            }
                            y += 4;
                            p.setColor(Color.rgb(25, 185, 172));
                            canvas.drawRect(left, y, right, y + 3, p);
                            y += 20;
                        } else {
                            y += 12;
                        }

                        p.setTypeface(Typeface.create(Typeface.DEFAULT, Typeface.BOLD));
                        p.setTextSize(11.5f);
                        p.setColor(Color.rgb(11, 37, 69));
                        canvas.drawText("REKAP PER SISWA", left, y, p);
                        y += 17;
                        p.setTextSize(9.5f);
                        for (Map.Entry<String, double[]> e : byStudent.entrySet()) {
                            double[] v = e.getValue();
                            p.setTypeface(Typeface.create(Typeface.DEFAULT, Typeface.BOLD));
                            p.setColor(Color.rgb(19,32,51));
                            drawCell(canvas, p, e.getKey(), left, y, 360);
                            p.setTypeface(Typeface.create(Typeface.DEFAULT, Typeface.NORMAL));
                            p.setColor(Color.rgb(90,103,120));
                            canvas.drawText(((int)v[0]) + " pertemuan", 430, y, p);
                            p.setTypeface(Typeface.create(Typeface.DEFAULT, Typeface.BOLD));
                            p.setColor(Color.rgb(19,32,51));
                            drawCellRight(canvas, p, rupiah(v[1]), right, y, 165);
                            y += 18;
                        }

                        y += 10;
                        p.setTypeface(Typeface.create(Typeface.DEFAULT, Typeface.BOLD));
                        p.setTextSize(12f);
                        p.setColor(Color.rgb(11, 37, 69));
                        String recapHeading = (recapTitle == null || recapTitle.trim().isEmpty())
                                ? "Rekapitulasi Pertemuan Les"
                                : recapTitle.trim();
                        drawCell(canvas, p, recapHeading, left, y, right - left);
                        y += 20;

                        for (Map.Entry<String, double[]> e : byTeacher.entrySet()) {
                            double[] v = e.getValue();
                            String[] bank = teacherBank.get(e.getKey());
                            String bankName = bank != null ? bank[0] : "";
                            String holder = bank != null ? bank[1] : e.getKey();
                            String account = bank != null ? bank[2] : "";

                            p.setTypeface(Typeface.create(Typeface.DEFAULT, Typeface.BOLD));
                            p.setTextSize(10.5f);
                            p.setColor(Color.rgb(19,32,51));
                            drawCell(canvas, p, e.getKey(), left, y, 500);
                            y += 15;

                            p.setTypeface(Typeface.create(Typeface.DEFAULT, Typeface.NORMAL));
                            p.setTextSize(9.5f);
                            p.setColor(Color.rgb(74,91,112));
                            canvas.drawText(((int)v[0]) + " pertemuan", left, y, p);
                            y += 14;

                            if (!bankName.trim().isEmpty()) {
                                String bankLine = "Rek. " + bankName.trim() + " an. " +
                                        (holder.trim().isEmpty() ? e.getKey() : holder.trim());
                                drawCell(canvas, p, bankLine, left, y, 550);
                                y += 14;
                            }
                            if (!account.trim().isEmpty()) {
                                canvas.drawText("Norek. " + account.trim(), left, y, p);
                                y += 14;
                            }
                            if (bankName.trim().isEmpty() && account.trim().isEmpty()) {
                                p.setColor(Color.rgb(160,95,30));
                                canvas.drawText("Data rekening belum diisi", left, y, p);
                                y += 14;
                            }

                            p.setColor(Color.rgb(226,232,240));
                            canvas.drawLine(left, y + 2, right, y + 2, p);
                            y += 12;
                        }

                        y += 4;
                        p.setTypeface(Typeface.create(Typeface.DEFAULT, Typeface.BOLD));
                        p.setTextSize(12f);
                        p.setColor(Color.rgb(11, 37, 69));
                        canvas.drawText("REKAP TRANSFER", left, y, p);
                        y += 19;

                        for (Map.Entry<String, Double> e : transferAmount.entrySet()) {
                            String[] bank = transferBank.get(e.getKey());
                            String bankName = bank != null ? bank[0] : "";
                            String holder = bank != null ? bank[1] : "";
                            String account = bank != null ? bank[2] : "";
                            TreeSet<String> names = transferTeachers.get(e.getKey());
                            String teachers = names == null ? "" : android.text.TextUtils.join(", ", names);

                            p.setTypeface(Typeface.create(Typeface.DEFAULT, Typeface.BOLD));
                            p.setTextSize(10.5f);
                            p.setColor(Color.rgb(19,32,51));
                            String transferTitle = bankName.trim().isEmpty()
                                    ? "Rekening belum lengkap"
                                    : "Transfer ke " + bankName.trim();
                            drawCell(canvas, p, transferTitle, left, y, 370);
                            drawCellRight(canvas, p, rupiah(e.getValue()), right, y, 190);
                            y += 15;

                            p.setTypeface(Typeface.create(Typeface.DEFAULT, Typeface.NORMAL));
                            p.setTextSize(9.5f);
                            p.setColor(Color.rgb(74,91,112));
                            if (!holder.trim().isEmpty()) {
                                drawCell(canvas, p, "a.n. " + holder.trim(), left, y, 400);
                                y += 14;
                            }
                            if (!account.trim().isEmpty()) {
                                canvas.drawText("Norek. " + account.trim(), left, y, p);
                                y += 14;
                            } else {
                                p.setColor(Color.rgb(160,95,30));
                                canvas.drawText("Nomor rekening belum diisi", left, y, p);
                                y += 14;
                            }
                            if (!teachers.trim().isEmpty()) {
                                p.setColor(Color.rgb(90,103,120));
                                drawCell(canvas, p, "Untuk: " + teachers, left, y, 650);
                                y += 14;
                            }

                            p.setColor(Color.rgb(226,232,240));
                            canvas.drawLine(left, y + 2, right, y + 2, p);
                            y += 12;
                        }

                        y += 3;
                        p.setColor(Color.rgb(11, 37, 69));
                        canvas.drawRect(left, y, right, y + 2, p);
                        y += 21;
                        p.setTypeface(Typeface.create(Typeface.DEFAULT, Typeface.BOLD));
                        p.setTextSize(12.5f);
                        canvas.drawText("GRAND TOTAL TAGIHAN", 555, y, p);
                        drawCellRight(canvas, p, totalText, right, y, 165);
                        y += 21;

                        p.setTypeface(Typeface.create(Typeface.DEFAULT, Typeface.NORMAL));
                        p.setTextSize(8.5f);
                        p.setColor(Color.rgb(107,119,140));
                        canvas.drawText("Rekap di atas berdasarkan siswa dan pengajar yang dipilih pada tagihan.", left, Math.min(y + 6, 565), p);
                        doc.finishPage(page);
                        break;
                    } else {
                        doc.finishPage(page);
                        pageNo++;
                    }
                }

                OutputStream out = openDownload(fileName, "application/pdf");
                doc.writeTo(out);
                out.flush();
                out.close();
                toast("PDF tagihan tersimpan di folder Download/PrivatKomisi");
            } catch (Exception e) {
                toast("Gagal menyimpan PDF: " + e.getMessage());
            } finally {
                doc.close();
            }
        }

        private void drawCell(Canvas c, Paint p, String text, float x, float y, float maxWidth) {
            c.drawText(fit(text, p, maxWidth), x, y, p);
        }

        private void drawCellRight(Canvas c, Paint p, String text, float rightX, float y, float maxWidth) {
            String t = fit(text, p, maxWidth);
            c.drawText(t, rightX - p.measureText(t), y, p);
        }

        private String fit(String text, Paint p, float maxWidth) {
            if (text == null) return "";
            if (p.measureText(text) <= maxWidth) return text;
            String ell = "…";
            int len = text.length();
            while (len > 1 && p.measureText(text.substring(0, len) + ell) > maxWidth) len--;
            return text.substring(0, Math.max(1, len)) + ell;
        }

        private String rupiah(double value) {
            NumberFormat nf = NumberFormat.getNumberInstance(new Locale("id", "ID"));
            nf.setMaximumFractionDigits(0);
            return "Rp " + nf.format(Math.round(value));
        }

        private OutputStream openDownload(String fileName, String mimeType) throws Exception {
            String safe = fileName.replaceAll("[\\/:*?\"<>|]", "_");
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                ContentValues values = new ContentValues();
                values.put(MediaStore.MediaColumns.DISPLAY_NAME, safe);
                values.put(MediaStore.MediaColumns.MIME_TYPE, mimeType);
                values.put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS + "/PrivatKomisi");
                ContentResolver resolver = context.getContentResolver();
                Uri uri = resolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values);
                if (uri == null) throw new Exception("Tidak dapat membuat file");
                OutputStream os = resolver.openOutputStream(uri);
                if (os == null) throw new Exception("Tidak dapat membuka file");
                return os;
            } else {
                File dir = new File(context.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS), "PrivatKomisi");
                if (!dir.exists() && !dir.mkdirs()) throw new Exception("Folder tidak dapat dibuat");
                return new FileOutputStream(new File(dir, safe));
            }
        }

        private void toast(final String msg) {
            activity.runOnUiThread(() -> Toast.makeText(context, msg, Toast.LENGTH_LONG).show());
        }
    }
}
