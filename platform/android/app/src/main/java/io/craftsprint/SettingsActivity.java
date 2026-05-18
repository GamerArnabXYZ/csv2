package io.craftsprint;

import android.app.Activity;
import android.content.Context;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Color;
import android.graphics.Matrix;
import android.graphics.Typeface;
import android.graphics.drawable.BitmapDrawable;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.Gravity;
import android.view.View;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.SeekBar;
import android.widget.TextView;
import java.io.InputStream;

public class SettingsActivity extends Activity {

    private Typeface         mcFont;
    private Bitmap           btnBmp;
    private Bitmap           panoBmp, panoBmp1;
    private float            panoOffset = 0f;
    private PanoView         panoView;
    private SharedPreferences prefs;
    private Handler          handler = new Handler(Looper.getMainLooper());

    class PanoView extends View {
        private android.graphics.Paint paint = new android.graphics.Paint(android.graphics.Paint.FILTER_BITMAP_FLAG);
        private Matrix matrix = new Matrix();
        PanoView(Context ctx) { super(ctx); }
        @Override protected void onDraw(android.graphics.Canvas canvas) {
            if (panoBmp == null || panoBmp1 == null) {
                canvas.drawColor(Color.parseColor("#111111"));
                return;
            }
            int vw = getWidth(), vh = getHeight();
            float s1 = (float)vh/panoBmp.getHeight(), s2 = (float)vh/panoBmp1.getHeight();
            float w1 = panoBmp.getWidth()*s1, w2 = panoBmp1.getWidth()*s2, totalW = w1+w2;
            float scrollX = (panoOffset * totalW) % totalW;
            float x = -scrollX;
            while (x < vw) {
                if (x+w1 > 0) { 
                    matrix.reset(); matrix.postScale(s1, s1); matrix.postTranslate(x, 0); 
                    canvas.drawBitmap(panoBmp, matrix, paint); 
                }
                x += w1;
                if (x < vw && x+w2 > 0) { 
                    matrix.reset(); matrix.postScale(s2, s2); matrix.postTranslate(x, 0); 
                    canvas.drawBitmap(panoBmp1, matrix, paint); 
                }
                x += w2;
            }
            int darkVal = prefs.getInt("bg-darkness", 45);
            canvas.drawColor(Color.argb(Math.round(darkVal*2.55f), 0, 0, 0));
        }
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN);

        prefs = getSharedPreferences("craftsprint", Context.MODE_PRIVATE);

        try {
            mcFont = Typeface.createFromAsset(getAssets(), "fonts/Minecraft.ttf");
            InputStream bi = getAssets().open("button_bg.png");
            btnBmp = BitmapFactory.decodeStream(bi);
            panoBmp  = BitmapFactory.decodeStream(getAssets().open("panorama_bg.png"));
            panoBmp1 = BitmapFactory.decodeStream(getAssets().open("panorama_bg1.png"));
        } catch (Exception e) { mcFont = Typeface.DEFAULT_BOLD; }

        FrameLayout root = new FrameLayout(this);
        
        // Panorama background
        panoView = new PanoView(this);
        root.addView(panoView, new FrameLayout.LayoutParams(-1, -1));

        ScrollView scroll = new ScrollView(this);
        scroll.setFillViewport(true);

        LinearLayout col = new LinearLayout(this);
        col.setOrientation(LinearLayout.VERTICAL);
        col.setGravity(Gravity.CENTER_HORIZONTAL);
        col.setPadding(dp(24), dp(36), dp(24), dp(36));

        col.addView(makeTitleTv("⚙  Settings"));
        col.addView(makeSlider("Music Volume",          "music-vol",    80,  0, 100));
        col.addView(makeSlider("Swipe Sensitivity",     "sensitivity",  50,  0, 100));
        col.addView(makeSlider("Background Darkness",   "bg-darkness",  45,  0, 100));
        col.addView(makeSlider("Graphics Quality (1-3)","gfx-quality",   3,  1,   3));

        int best = prefs.getInt("best", 0);
        TextView bestTv = new TextView(this);
        bestTv.setText("Best Score: " + best);
        bestTv.setTextSize(14);
        bestTv.setTextColor(Color.parseColor("#55ff55"));
        bestTv.setTypeface(mcFont);
        bestTv.setGravity(Gravity.CENTER);
        LinearLayout.LayoutParams bP = new LinearLayout.LayoutParams(-1, -2);
        bP.topMargin = dp(18); bP.bottomMargin = dp(6);
        col.addView(bestTv, bP);

        Button resetBtn = makeMcBtn("Reset Best Score", dp(48));
        resetBtn.setOnClickListener(v -> {
            prefs.edit().remove("best").apply();
            bestTv.setText("Best Score: 0");
        });
        col.addView(resetBtn);

        View div = new View(this);
        div.setBackgroundColor(Color.parseColor("#333333"));
        LinearLayout.LayoutParams divP = new LinearLayout.LayoutParams(-1, dp(1));
        divP.topMargin = dp(24); divP.bottomMargin = dp(20);
        col.addView(div, divP);

        Button backBtn = makeMcBtn("✔  Save & Back", dp(50));
        backBtn.setOnClickListener(v -> finish());
        col.addView(backBtn);

        scroll.addView(col);
        root.addView(scroll, new FrameLayout.LayoutParams(-1, -1));
        setContentView(root);

        Runnable loop = new Runnable() {
            public void run() {
                panoOffset += 0.0004f;
                if (panoOffset >= 1.0f) panoOffset = 0f;
                if (panoView != null) panoView.invalidate();
                handler.postDelayed(this, 16);
            }
        };
        handler.post(loop);
    }

    private LinearLayout makeSlider(String label, String key, int def, int min, int max) {
        LinearLayout row = new LinearLayout(this);
        row.setOrientation(LinearLayout.VERTICAL);
        LinearLayout.LayoutParams rP = new LinearLayout.LayoutParams(-1, -2);
        rP.bottomMargin = dp(20);
        row.setLayoutParams(rP);

        int saved = prefs.getInt(key, def);
        TextView lbl = new TextView(this);
        lbl.setText(label + ": " + saved);
        lbl.setTextColor(Color.WHITE);
        lbl.setTextSize(13);
        lbl.setTypeface(mcFont);
        row.addView(lbl);

        SeekBar sb = new SeekBar(this);
        // Custom Minecraft-like look
        sb.getProgressDrawable().setColorFilter(Color.parseColor("#555555"), android.graphics.PorterDuff.Mode.SRC_IN);
        sb.getThumb().setColorFilter(Color.parseColor("#AAAAAA"), android.graphics.PorterDuff.Mode.SRC_IN);
        
        sb.setMax(max - min);
        sb.setProgress(saved - min);
        sb.setOnSeekBarChangeListener(new SeekBar.OnSeekBarChangeListener() {
            public void onProgressChanged(SeekBar s, int progress, boolean fromUser) {
                int val = progress + min;
                lbl.setText(label + ": " + val);
                prefs.edit().putInt(key, val).apply();
            }
            public void onStartTrackingTouch(SeekBar s) {}
            public void onStopTrackingTouch(SeekBar s) {}
        });
        row.addView(sb);
        return row;
    }

    private TextView makeTitleTv(String text) {
        TextView tv = new TextView(this);
        tv.setText(text); tv.setTextSize(24); tv.setTextColor(Color.WHITE);
        tv.setTypeface(mcFont); tv.setGravity(Gravity.CENTER);
        tv.setShadowLayer(4, 2, 2, Color.BLACK);
        LinearLayout.LayoutParams p = new LinearLayout.LayoutParams(-1, -2);
        p.bottomMargin = dp(28);
        tv.setLayoutParams(p);
        return tv;
    }

    private Button makeMcBtn(String label, int heightPx) {
        Button b = new Button(this);
        b.setText(label); b.setAllCaps(false); b.setTypeface(mcFont);
        b.setTextColor(Color.WHITE); b.setTextSize(15);
        b.setShadowLayer(3, 2, 2, Color.BLACK);
        if (btnBmp != null) b.setBackground(new BitmapDrawable(getResources(), btnBmp));
        LinearLayout.LayoutParams p = new LinearLayout.LayoutParams(dp(260), heightPx);
        p.gravity = Gravity.CENTER_HORIZONTAL; p.topMargin = dp(8);
        b.setLayoutParams(p);
        return b;
    }

    private int dp(int v) {
        return Math.round(v * getResources().getDisplayMetrics().density);
    }
}
