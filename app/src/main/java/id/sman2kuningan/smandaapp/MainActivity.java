package id.sman2kuningan.smandaapp;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.graphics.BitmapFactory;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.Gravity;
import android.view.View;
import android.webkit.CookieManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.ScrollView;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;

import java.net.URLEncoder;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;

public class MainActivity extends Activity {
    private static final String BASE = "https://simsmanda.mathpakdadi.my.id/";
    private static final String LOGIN_URL = BASE + "login.php?app=smandaapp";

    private FrameLayout root;
    private WebView web;
    private EditText username, password;
    private Spinner yearSpinner;
    private Button loginButton;
    private ProgressBar progress;
    private final ArrayList<String> yearLabels = new ArrayList<>();
    private final ArrayList<String> yearValues = new ArrayList<>();
    private ArrayAdapter<String> yearAdapter;
    private boolean loginPending = false;
    private final Handler handler = new Handler(Looper.getMainLooper());

    private int dp(int v) { return Math.round(v * getResources().getDisplayMetrics().density); }

    private GradientDrawable rounded(int color, float radius, int strokeColor, int strokeWidth) {
        GradientDrawable g = new GradientDrawable();
        g.setColor(color);
        g.setCornerRadius(dp((int) radius));
        if (strokeWidth > 0) g.setStroke(dp(strokeWidth), strokeColor);
        return g;
    }

    private TextView text(String s, int sp, int color, int style) {
        TextView t = new TextView(this);
        t.setText(s);
        t.setTextSize(sp);
        t.setTextColor(color);
        t.setTypeface(Typeface.DEFAULT, style);
        return t;
    }

    @SuppressLint({"SetJavaScriptEnabled", "AddJavascriptInterface"})
    @Override public void onCreate(Bundle b) {
        super.onCreate(b);
        getWindow().setStatusBarColor(Color.rgb(20, 83, 202));
        getWindow().setNavigationBarColor(Color.WHITE);
        root = new FrameLayout(this);
        setContentView(root);
        buildLoginUi();
        buildWebView();
        web.loadUrl(LOGIN_URL);
    }

    private void buildLoginUi() {
        ScrollView scroll = new ScrollView(this);
        scroll.setFillViewport(true);
        root.addView(scroll, new FrameLayout.LayoutParams(-1,-1));

        LinearLayout page = new LinearLayout(this);
        page.setOrientation(LinearLayout.VERTICAL);
        page.setBackgroundColor(Color.rgb(245,249,255));
        scroll.addView(page, new ScrollView.LayoutParams(-1,-2));

        FrameLayout hero = new FrameLayout(this);
        page.addView(hero, new LinearLayout.LayoutParams(-1, dp(265)));

        ImageView bg = new ImageView(this);
        bg.setScaleType(ImageView.ScaleType.CENTER_CROP);
        hero.addView(bg, new FrameLayout.LayoutParams(-1,-1));
        new Thread(() -> {
            try {
                final android.graphics.Bitmap bm = BitmapFactory.decodeStream(
                    new URL("https://sman2kuningan.sch.id/wp-content/uploads/2024/12/WhatsApp-Image-2024-12-03-at-10.48.19-1100x525.jpeg").openStream()
                );
                runOnUiThread(() -> bg.setImageBitmap(bm));
            } catch(Exception ignored) {}
        }).start();

        View overlay = new View(this);
        GradientDrawable ov = new GradientDrawable(
            GradientDrawable.Orientation.TOP_BOTTOM,
            new int[]{0x441354C5,0xD90E4FC4}
        );
        overlay.setBackground(ov);
        hero.addView(overlay, new FrameLayout.LayoutParams(-1,-1));

        ImageView logo = new ImageView(this);
        logo.setScaleType(ImageView.ScaleType.CENTER_CROP);
        new Thread(() -> {
            try {
                final android.graphics.Bitmap bm = BitmapFactory.decodeStream(
                    new URL("https://sman2kuningan.sch.id/wp-content/themes/mading/images/logo.png").openStream()
                );
                runOnUiThread(() -> logo.setImageBitmap(bm));
            } catch(Exception ignored) {}
        }).start();
        logo.setBackground(rounded(Color.WHITE,26,Color.WHITE,3));
        logo.setPadding(dp(8),dp(8),dp(8),dp(8));
        FrameLayout.LayoutParams lpLogo = new FrameLayout.LayoutParams(
            dp(118),dp(118),Gravity.CENTER_HORIZONTAL|Gravity.BOTTOM
        );
        lpLogo.bottomMargin = dp(14);
        hero.addView(logo,lpLogo);

        LinearLayout white = new LinearLayout(this);
        white.setOrientation(LinearLayout.VERTICAL);
        white.setPadding(dp(22),dp(6),dp(22),dp(20));
        white.setGravity(Gravity.CENTER_HORIZONTAL);
        white.setBackground(rounded(Color.WHITE,30,Color.WHITE,0));
        LinearLayout.LayoutParams whiteLp = new LinearLayout.LayoutParams(-1,-2);
        whiteLp.setMargins(dp(8),-dp(22),dp(8),0);
        page.addView(white,whiteLp);

        TextView title = text("SmandaApp",38,Color.rgb(10,42,112),Typeface.BOLD);
        title.setGravity(Gravity.CENTER);
        white.addView(title,new LinearLayout.LayoutParams(-1,-2));

        TextView school = text("SMAN 2 KUNINGAN",19,Color.rgb(17,88,218),Typeface.BOLD);
        school.setGravity(Gravity.CENTER);
        school.setLetterSpacing(.17f);
        LinearLayout.LayoutParams slp=new LinearLayout.LayoutParams(-1,-2);
        slp.topMargin=dp(2);
        white.addView(school,slp);

        TextView app = text("Aplikasi Siswa",16,Color.rgb(67,83,112),Typeface.BOLD);
        app.setGravity(Gravity.CENTER);
        LinearLayout.LayoutParams alp=new LinearLayout.LayoutParams(-1,-2);
        alp.topMargin=dp(12);
        white.addView(app,alp);

        TextView desc=text("Akses informasi akademik, kehadiran, tugas, dan kegiatan sekolah",14,Color.rgb(85,101,130),Typeface.NORMAL);
        desc.setGravity(Gravity.CENTER);
        desc.setMaxLines(2);
        LinearLayout.LayoutParams dlp=new LinearLayout.LayoutParams(-1,-2);
        dlp.setMargins(dp(20),dp(4),dp(20),dp(14));
        white.addView(desc,dlp);

        LinearLayout loginCard = new LinearLayout(this);
        loginCard.setOrientation(LinearLayout.VERTICAL);
        loginCard.setPadding(dp(16),dp(16),dp(16),dp(16));
        loginCard.setBackground(rounded(Color.WHITE,22,0xFFE3ECFA,1));
        LinearLayout.LayoutParams clp=new LinearLayout.LayoutParams(-1,-2);
        clp.setMargins(0,dp(4),0,0);
        white.addView(loginCard,clp);

        username = new EditText(this);
        username.setHint("Username");
        username.setSingleLine(true);
        username.setTextSize(16);
        username.setPadding(dp(16),0,dp(16),0);
        username.setBackground(rounded(0xFFFDFEFF,15,0xFFBED1EF,1));
        loginCard.addView(username,new LinearLayout.LayoutParams(-1,dp(62)));

        password = new EditText(this);
        password.setHint("Password");
        password.setSingleLine(true);
        password.setTextSize(16);
        password.setInputType(0x00000081);
        password.setPadding(dp(16),0,dp(16),0);
        password.setBackground(rounded(0xFFFDFEFF,15,0xFFBED1EF,1));
        LinearLayout.LayoutParams plp=new LinearLayout.LayoutParams(-1,dp(62));
        plp.topMargin=dp(10);
        loginCard.addView(password,plp);

        yearSpinner = new Spinner(this);
        yearLabels.add("Memuat Tahun Ajaran...");
        yearValues.add("");
        yearAdapter = new ArrayAdapter<String>(this, android.R.layout.simple_spinner_dropdown_item, yearLabels);
        yearSpinner.setAdapter(yearAdapter);
        yearSpinner.setBackground(rounded(0xFFFDFEFF,15,0xFFBED1EF,1));
        yearSpinner.setPadding(dp(12),0,dp(12),0);
        LinearLayout.LayoutParams ylp=new LinearLayout.LayoutParams(-1,dp(62));
        ylp.topMargin=dp(10);
        loginCard.addView(yearSpinner,ylp);

        loginButton = new Button(this);
        loginButton.setText("⇥  Masuk");
        loginButton.setTextColor(Color.WHITE);
        loginButton.setTextSize(18);
        loginButton.setTypeface(Typeface.DEFAULT,Typeface.BOLD);
        loginButton.setAllCaps(false);
        loginButton.setBackground(rounded(0xFF1259D8,15,0,0));
        loginButton.setEnabled(false);
        LinearLayout.LayoutParams blp=new LinearLayout.LayoutParams(-1,dp(62));
        blp.topMargin=dp(14);
        loginCard.addView(loginButton,blp);
        loginButton.setOnClickListener(v -> submitLogin());

        progress = new ProgressBar(this);
        progress.setVisibility(View.GONE);
        LinearLayout.LayoutParams prlp=new LinearLayout.LayoutParams(dp(30),dp(30));
        prlp.gravity=Gravity.CENTER_HORIZONTAL;
        prlp.topMargin=dp(10);
        white.addView(progress,prlp);

        TextView sim = text("SIM SMANDA  |  Tahun Ajaran Aktif",13,Color.rgb(17,88,218),Typeface.BOLD);
        sim.setGravity(Gravity.CENTER);
        LinearLayout.LayoutParams simlp=new LinearLayout.LayoutParams(-1,-2);
        simlp.topMargin=dp(18);
        white.addView(sim,simlp);

        TextView credit = text("Dibuat dan dikembangkan oleh Dadi Hardadi dan OSIS SMANDA",12,Color.rgb(69,84,110),Typeface.NORMAL);
        credit.setGravity(Gravity.CENTER);
        credit.setPadding(dp(12),dp(12),dp(12),dp(12));
        credit.setBackground(rounded(0xFFF9FBFF,20,0xFFDCE7F8,1));
        LinearLayout.LayoutParams crlp=new LinearLayout.LayoutParams(-1,-2);
        crlp.setMargins(0,dp(12),0,0);
        white.addView(credit,crlp);
    }

    @SuppressLint({"SetJavaScriptEnabled", "AddJavascriptInterface"})
    private void buildWebView() {
        web = new WebView(this);
        web.setVisibility(View.INVISIBLE);
        FrameLayout.LayoutParams wlp = new FrameLayout.LayoutParams(dp(2),dp(2));
        wlp.gravity=Gravity.BOTTOM|Gravity.RIGHT;
        root.addView(web,wlp);

        CookieManager cm = CookieManager.getInstance();
        cm.setAcceptCookie(true);
        cm.setAcceptThirdPartyCookies(web, true);

        WebSettings s=web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setLoadWithOverviewMode(true);
        s.setUseWideViewPort(true);
        s.setUserAgentString(s.getUserAgentString()+" SmandaApp/1.2.0 SIM-SMANDA-App");
        web.addJavascriptInterface(new Bridge(),"SmandaNative");

        web.setWebViewClient(new WebViewClient(){
            @Override public void onPageFinished(WebView view,String url){
                if (url == null) return;
                String low = url.toLowerCase();

                if (low.startsWith(BASE.toLowerCase()) && !low.contains("login.php")) {
                    loginPending = false;
                    injectAppMode(view);
                    showPortal();
                    return;
                }

                if(low.contains("login.php") || low.equals(BASE.toLowerCase()) || low.startsWith((BASE+"?").toLowerCase())){
                    if (web.getVisibility() == View.VISIBLE && !loginPending) {
                        returnToNativeLogin();
                        return;
                    }
                    String js="(function(){var s=document.getElementById('tahun_ajaran_id');var a=[];if(s){for(var i=0;i<s.options.length;i++){var o=s.options[i];if(o.value)a.push({v:o.value,t:o.text,sel:o.selected});}}SmandaNative.setYears(JSON.stringify(a));var e=document.querySelector('.error-box');if(e){SmandaNative.loginError(e.innerText);}else if("+(loginPending?"true":"false")+"){SmandaNative.loginReturnedWithoutError();}})();";
                    view.evaluateJavascript(js,null);
                }
            }
        });
    }

    private void submitLogin(){
        String u=username.getText().toString().trim();
        String p=password.getText().toString();
        int pos=yearSpinner.getSelectedItemPosition();
        if(u.isEmpty()||p.isEmpty()||pos<0||pos>=yearValues.size()||yearValues.get(pos).isEmpty()){
            Toast.makeText(this,"Lengkapi username, password, dan tahun ajaran.",Toast.LENGTH_SHORT).show();
            return;
        }

        loginPending = true;
        loginButton.setEnabled(false);
        progress.setVisibility(View.VISIBLE);

        try {
            String body = "username=" + URLEncoder.encode(u, "UTF-8")
                + "&password=" + URLEncoder.encode(p, "UTF-8")
                + "&tahun_ajaran_id=" + URLEncoder.encode(yearValues.get(pos), "UTF-8");
            web.postUrl(BASE + "login.php", body.getBytes(StandardCharsets.UTF_8));
        } catch (Exception e) {
            loginPending = false;
            progress.setVisibility(View.GONE);
            loginButton.setEnabled(true);
            Toast.makeText(this,"Gagal mengirim login. Silakan coba lagi.",Toast.LENGTH_LONG).show();
            return;
        }

        handler.postDelayed(() -> {
            if (!loginPending) return;
            String current = web.getUrl();
            if (current != null && current.startsWith(BASE) && !current.toLowerCase().contains("login.php")) {
                loginPending = false;
                showPortal();
            } else {
                loginPending = false;
                progress.setVisibility(View.GONE);
                loginButton.setEnabled(true);
                Toast.makeText(MainActivity.this,"Login belum berhasil. Periksa akun, password, atau koneksi internet.",Toast.LENGTH_LONG).show();
            }
        }, 18000);
    }

    private void injectAppMode(WebView view){
        String js="(function(){"
            +"var id='smandaapp-native-style';var st=document.getElementById(id);"
            +"if(!st){st=document.createElement('style');st.id=id;st.innerHTML='"
            +".sims-sidebar,.sims-mobile-menu-btn,.sims-sidebar-overlay{display:none!important;}"
            +".wrapper{display:block!important;width:100%!important;max-width:100%!important;}"
            +".wrapper>.content,main.content{width:100%!important;max-width:100%!important;margin-left:0!important;}"
            +"body{overflow-x:hidden!important;}';document.head.appendChild(st);}"
            +"var sb=document.querySelector('.sims-sidebar');if(sb)sb.classList.remove('mobile-open');"
            +"var ov=document.querySelector('.sims-sidebar-overlay');if(ov)ov.classList.remove('mobile-open');"
            +"var m=document.querySelector('meta[name=viewport]');if(!m){m=document.createElement('meta');m.name='viewport';document.head.appendChild(m);}"
            +"m.content='width=device-width,initial-scale=1,maximum-scale=1,viewport-fit=cover';"
            +"})();";
        view.evaluateJavascript(js,null);
    }

    private void returnToNativeLogin(){
        loginPending = false;
        progress.setVisibility(View.GONE);
        loginButton.setEnabled(true);
        web.setVisibility(View.INVISIBLE);
        handler.postDelayed(this::recreate, 120);
    }

    private void showPortal(){
        loginPending = false;
        progress.setVisibility(View.GONE);
        loginButton.setEnabled(true);
        try { root.removeView(web); } catch(Exception ignored) {}
        FrameLayout.LayoutParams full=new FrameLayout.LayoutParams(-1,-1);
        root.addView(web,full);
        web.setVisibility(View.VISIBLE);
        injectAppMode(web);
    }

    public class Bridge {
        @JavascriptInterface public void setYears(final String json){
            runOnUiThread(() -> {
                try{
                    org.json.JSONArray arr=new org.json.JSONArray(json);
                    yearLabels.clear();
                    yearValues.clear();
                    int selected=0;
                    for(int i=0;i<arr.length();i++){
                        org.json.JSONObject o=arr.getJSONObject(i);
                        yearValues.add(o.optString("v"));
                        yearLabels.add(o.optString("t"));
                        if(o.optBoolean("sel")) selected=i;
                    }
                    yearAdapter.notifyDataSetChanged();
                    if(!yearLabels.isEmpty()){
                        yearSpinner.setSelection(selected);
                        if (!loginPending) loginButton.setEnabled(true);
                    } else {
                        yearLabels.add("Tahun ajaran tidak ditemukan");
                        yearValues.add("");
                        yearAdapter.notifyDataSetChanged();
                    }
                }catch(Exception e){
                    Toast.makeText(MainActivity.this,"Gagal membaca tahun ajaran.",Toast.LENGTH_SHORT).show();
                }
            });
        }

        @JavascriptInterface public void loginError(final String msg){
            runOnUiThread(() -> {
                loginPending = false;
                progress.setVisibility(View.GONE);
                loginButton.setEnabled(true);
                if(msg!=null&&!msg.trim().isEmpty())
                    Toast.makeText(MainActivity.this,msg.trim(),Toast.LENGTH_LONG).show();
            });
        }

        @JavascriptInterface public void loginReturnedWithoutError(){
            runOnUiThread(() -> {
                if (!loginPending) return;
                handler.postDelayed(() -> {
                    if (loginPending && web.getUrl()!=null && web.getUrl().toLowerCase().contains("login.php")) {
                        loginPending = false;
                        progress.setVisibility(View.GONE);
                        loginButton.setEnabled(true);
                        Toast.makeText(MainActivity.this,"Login tidak berpindah ke dashboard. Silakan coba lagi.",Toast.LENGTH_LONG).show();
                    }
                }, 2500);
            });
        }
    }

    @Override public void onBackPressed(){
        if(web.getVisibility()==View.VISIBLE && web.canGoBack()) web.goBack();
        else if(web.getVisibility()==View.VISIBLE){ web.setVisibility(View.INVISIBLE); recreate(); }
        else super.onBackPressed();
    }
}
