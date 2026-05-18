package io.craftsprint;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Matrix;
import android.graphics.Paint;
import android.graphics.Typeface;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.Gravity;
import android.view.View;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.TextView;
import java.io.InputStream;

public class AboutActivity extends Activity {
    private Typeface mcFont;
    private Bitmap panoBmp, panoBmp1;
    private float panoOffset = 0f;
    private PanoView panoView;
    private Handler handler = new Handler(Looper.getMainLooper());
    private SharedPreferences prefs;

    class PanoView extends View {
        private Paint paint = new Paint(Paint.FILTER_BITMAP_FLAG);
        private Matrix matrix = new Matrix();
        PanoView(Context ctx) { super(ctx); }
        @Override protected void onDraw(Canvas canvas) {
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
            mcFont = Typeface.createFromAsset(getAssets(),"fonts/Minecraft.ttf");
            panoBmp  = BitmapFactory.decodeStream(getAssets().open("panorama_bg.png"));
            panoBmp1 = BitmapFactory.decodeStream(getAssets().open("panorama_bg1.png"));
        } catch (Exception e) { mcFont = Typeface.DEFAULT_BOLD; }

        FrameLayout root = new FrameLayout(this);
        
        // Add Panorama View
        panoView = new PanoView(this);
        root.addView(panoView, new FrameLayout.LayoutParams(-1, -1));

        LinearLayout col = new LinearLayout(this);
        col.setOrientation(LinearLayout.VERTICAL);
        col.setGravity(Gravity.CENTER_HORIZONTAL);
        col.setPadding(dp(28), dp(40), dp(28), dp(40));
        // Semi-transparent background for content box
        col.setBackgroundColor(Color.parseColor("#88000000"));

        String[] lines = {
            "★  CraftSprint.IO  v3.1",
            "",
            "The block-world endless runner!",
            "",
            "🌿 Plains → 🌵 Desert → ❄ Snowy → 🔥 Nether",
            "",
            "Swipe ←→ to dodge obstacles",
            "Swipe ↑ to jump over low walls",
            "Swipe ↓ to slide under fences",
            "Collect 💎 Emeralds & 🪙 Gold",
            "Build combos for score multipliers!",
            "",
            "By GamerArnabXYZ · ArnabLabZ Studio",
        };

        for (String line : lines) {
            TextView tv = new TextView(this);
            tv.setText(line);
            boolean isTitle  = line.startsWith("★");
            boolean isBiome  = line.startsWith("🌿");
            boolean isCredit = line.startsWith("By");
            tv.setTextSize(isTitle ? 18 : 13);
            tv.setTextColor(isTitle ? Color.WHITE : isBiome ? Color.parseColor("#55ffff")
                          : isCredit ? Color.parseColor("#55ff55") : Color.LTGRAY);
            tv.setTypeface(mcFont);
            tv.setGravity(Gravity.CENTER);
            LinearLayout.LayoutParams p = new LinearLayout.LayoutParams(-1, -2);
            p.bottomMargin = dp(4);
            col.addView(tv, p);
        }

        // YouTube button
        Button ytBtn = new Button(this);
        ytBtn.setText("▶  YouTube Channel");
        ytBtn.setAllCaps(false); ytBtn.setTypeface(mcFont);
        ytBtn.setTextColor(Color.parseColor("#ff5555")); ytBtn.setTextSize(15);
        ytBtn.setBackgroundColor(Color.parseColor("#44000000"));
        ytBtn.setOnClickListener(v -> {
            startActivity(new Intent(Intent.ACTION_VIEW,
                Uri.parse("https://www.youtube.com/@Gamer_Arnab_XYZ")));
        });
        LinearLayout.LayoutParams ytP = new LinearLayout.LayoutParams(dp(240), dp(48));
        ytP.topMargin = dp(16); ytP.gravity = Gravity.CENTER_HORIZONTAL;
        col.addView(ytBtn, ytP);

        // Back
        Button back = new Button(this);
        back.setText("← Back"); back.setAllCaps(false);
        back.setTypeface(mcFont); back.setTextColor(Color.WHITE); back.setTextSize(16);
        back.setBackgroundColor(Color.parseColor("#44000000"));
        back.setOnClickListener(v -> finish());
        LinearLayout.LayoutParams bP = new LinearLayout.LayoutParams(dp(200), dp(48));
        bP.topMargin = dp(12); bP.gravity = Gravity.CENTER_HORIZONTAL;
        col.addView(back, bP);

        // Center content
        FrameLayout.LayoutParams colP = new FrameLayout.LayoutParams(dp(320), -2, Gravity.CENTER);
        root.addView(col, colP);

        setContentView(root);

        // Animation Loop
        handler.post(new Runnable() {
            @Override public void run() {
                panoOffset += 0.0004f;
                if (panoOffset >= 1.0f) panoOffset = 0.0f;
                if (panoView != null) panoView.invalidate();
                handler.postDelayed(this, 16);
            }
        });
    }

    @Override protected void onDestroy() {
        super.onDestroy();
        handler.removeCallbacksAndMessages(null);
    }

    private int dp(int v) {
        return Math.round(v * getResources().getDisplayMetrics().density);
    }
}
