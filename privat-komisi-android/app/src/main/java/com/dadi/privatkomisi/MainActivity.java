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
        public void saveInvoicePdf(String fileName, String recipient, String period, String rowsJson, String totalText) {
            PdfDocument doc = new PdfDocument();
            try {
                JSONArray rows = new JSONArray(rowsJson);
                final int width = 842;
                final int height = 595;
                final int left = 36;
                final int right = 806;
                final int topStart = 38;
                final int rowH = 23;

                Paint p = new Paint(Paint.ANTI_ALIAS_FLAG);
                p.setColor(Color.rgb(19, 32, 51));
                p.setTypeface(Typeface.create(Typeface.DEFAULT, Typeface.NORMAL));

                int pageNo = 1;
                int rowIndex = 0;

                while (rowIndex < rows.length() || pageNo == 1) {
                    PdfDocument.PageInfo info = new PdfDocument.PageInfo.Builder(width, height, pageNo).create();
                    PdfDocument.Page page = doc.startPage(info);
                    Canvas c = page.getCanvas();
                    c.drawColor(Color.WHITE);
                    int y = topStart;

                    p.setTypeface(Typeface.create(Typeface.DEFAULT, Typeface.BOLD));
                    p.setTextSize(18);
                    p.setColor(Color.rgb(11, 37, 69));
                    c.drawText("TAGIHAN LES PRIVAT", left, y, p);
                    y += 21;
                    p.setTextSize(10.5f);
                    p.setTypeface(Typeface.create(Typeface.DEFAULT, Typeface.NORMAL));
                    p.setColor(Color.rgb(74, 91, 112));
                    if (recipient != null && !recipient.trim().isEmpty()) {
                        c.drawText("Kepada: " + recipient.trim(), left, y, p);
                        y += 15;
                    }
                    c.drawText("Periode: " + period, left, y, p);
                    y += 17;
                    p.setColor(Color.rgb(25, 185, 172));
                    c.drawRect(left, y, right, y + 3, p);
                    y += 17;

                    p.setColor(Color.rgb(241,245,249));
                    c.drawRect(left, y - 14, right, y + 8, p);
                    p.setColor(Color.rgb(50, 65, 85));
                    p.setTypeface(Typeface.create(Typeface.DEFAULT, Typeface.BOLD));
                    p.setTextSize(9.5f);
                    drawCell(c, p, "No", 40, y, 25);
                    drawCell(c, p, "Tanggal", 76, y, 86);
                    drawCell(c, p, "Siswa", 170, y, 205);
                    drawCell(c, p, "Pengajar", 382, y, 215);
                    drawCellRight(c, p, "Tagihan", 800, y, 122);
                    y += 13;

                    p.setTypeface(Typeface.create(Typeface.DEFAULT, Typeface.NORMAL));
                    p.setTextSize(9.2f);
                    p.setColor(Color.rgb(19, 32, 51));

                    while (rowIndex < rows.length() && y < 525) {
                        JSONObject row = rows.getJSONObject(rowIndex);
                        if (rowIndex % 2 == 1) {
                            p.setColor(Color.rgb(250,252,254));
                            c.drawRect(left, y - 12, right, y + 10, p);
                            p.setColor(Color.rgb(19,32,51));
                        }
                        drawCell(c, p, String.valueOf(row.optInt("no", rowIndex + 1)), 40, y, 25);
                        drawCell(c, p, row.optString("date", ""), 76, y, 86);
                        drawCell(c, p, row.optString("student", ""), 170, y, 205);
                        drawCell(c, p, row.optString("teacher", ""), 382, y, 215);
                        drawCellRight(c, p, rupiah(row.optDouble("fee", 0)), 800, y, 122);
                        p.setColor(Color.rgb(226,232,240));
                        c.drawLine(left, y + 10, right, y + 10, p);
                        p.setColor(Color.rgb(19,32,51));
                        y += rowH;
                        rowIndex++;
                    }

                    if (rowIndex >= rows.length()) {
                        y += 10;
                        p.setColor(Color.rgb(11, 37, 69));
                        p.setTypeface(Typeface.create(Typeface.DEFAULT, Typeface.BOLD));
                        p.setTextSize(12.5f);
                        c.drawText("TOTAL TAGIHAN", 590, y, p);
                        drawCellRight(c, p, totalText, 800, y, 190);
                        y += 22;
                        p.setTypeface(Typeface.create(Typeface.DEFAULT, Typeface.NORMAL));
                        p.setTextSize(8.5f);
                        p.setColor(Color.rgb(107,119,140));
                        c.drawText("Dibuat melalui aplikasi Privat & Komisi", left, Math.min(y + 10, 565), p);
                    }

                    doc.finishPage(page);
                    pageNo++;
                    if (rowIndex >= rows.length()) break;
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
