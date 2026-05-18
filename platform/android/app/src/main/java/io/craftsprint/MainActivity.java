package io.craftsprint;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.BitmapShader;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Matrix;
import android.graphics.Paint;
import android.graphics.Shader;
import android.graphics.Typeface;
import android.graphics.drawable.BitmapDrawable;
import android.graphics.drawable.GradientDrawable;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;
import java.io.InputStream;

public class MainActivity extends Activity {

    private Typeface mcFont;
    private Bitmap   btnBmp;
    private Handler  handler = new Handler(Looper.getMainLooper());

    // Panorama scroll state
    private float    panoOffset = 0f;
    private Bitmap   panoBmp    = null;
    private Bitmap   panoBmp1   = null;
    private PanoView panoView   = null;
    private SharedPreferences prefs;

    private static final String[] SPLASHES = {
        "Swipe to Survive!", "Creeper? Aw man!", "Never dig down!",
        "Steve approves!", "Dodge like a pro!", "100% Blocky!",
        "No Herobrine inside", "TNT incoming!", "Parkour time!",
        "Built different!", "One more run!", "Run. Survive. Repeat."
    };

    // ── Custom View for scrolling panorama ──────────────────────
    class PanoView extends View {
        private Paint paint = new Paint(Paint.FILTER_BITMAP_FLAG);
        private Matrix matrix = new Matrix();

        PanoView(Activity ctx) { super(ctx); }

        @Override protected void onDraw(Canvas canvas) {
            if (panoBmp == null || panoBmp1 == null) {
                canvas.drawColor(Color.parseColor("#222222"));
                return;
            }
            int vw = getWidth();
            int vh = getHeight();

            float h1 = panoBmp.getHeight();
            float h2 = panoBmp1.getHeight();
            float scale1 = (float) vh / h1;
            float scale2 = (float) vh / h2;

            float w1 = panoBmp.getWidth() * scale1;
            float w2 = panoBmp1.getWidth() * scale2;
            float totalW = w1 + w2;

            float scrollX = (panoOffset * totalW) % totalW;

            float x = -scrollX;
            while (x < vw) {
                if (x + w1 > 0) {
                    matrix.reset();
                    matrix.postScale(scale1, scale1);
                    matrix.postTranslate(x, 0);
                    canvas.drawBitmap(panoBmp, matrix, paint);
                }
                x += w1;
                if (x < vw && x + w2 > 0) {
                    matrix.reset();
                    matrix.postScale(scale2, scale2);
                    matrix.postTranslate(x, 0);
                    canvas.drawBitmap(panoBmp1, matrix, paint);
                }
                x += w2;
            }

            int darkVal = prefs.getInt("bg-darkness", 45);
            int alpha = Math.round(darkVal * 2.55f);
            canvas.drawColor(Color.argb(alpha, 0, 0, 0));
        }
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        prefs = getSharedPreferences("craftsprint", Context.MODE_PRIVATE);

        try {
            mcFont = Typeface.createFromAsset(getAssets(), "fonts/Minecraft.ttf");
            InputStream bi = getAssets().open("button_bg.png");
            btnBmp  = BitmapFactory.decodeStream(bi);
            panoBmp  = BitmapFactory.decodeStream(getAssets().open("panorama_bg.png"));
            panoBmp1 = BitmapFactory.decodeStream(getAssets().open("panorama_bg1.png"));
        } catch (Exception e) { mcFont = Typeface.DEFAULT_BOLD; }

        FrameLayout root = new FrameLayout(this);
        root.setLayoutParams(new ViewGroup.LayoutParams(-1, -1));

        panoView = new PanoView(this);
        root.addView(panoView, new FrameLayout.LayoutParams(-1, -1));

        LinearLayout col = new LinearLayout(this);
        col.setOrientation(LinearLayout.VERTICAL);
        col.setGravity(Gravity.CENTER_HORIZONTAL | Gravity.CENTER_VERTICAL);
        col.setLayoutParams(new FrameLayout.LayoutParams(-1, -1));

        Bitmap logoBmp = null;
        try {
            InputStream li = getAssets().open("header_logo.png");
            logoBmp = BitmapFactory.decodeStream(li);
        } catch (Exception ignored) {}

        if (logoBmp != null) {
            ImageView logo = new ImageView(this);
            logo.setImageBitmap(logoBmp);
            logo.setScaleType(ImageView.ScaleType.FIT_CENTER);
            LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(
                (int)(getResources().getDisplayMetrics().widthPixels * 0.78f), dp(90));
            lp.bottomMargin = dp(10);
            lp.gravity = Gravity.CENTER_HORIZONTAL;
            col.addView(logo, lp);
        }

        TextView splashTv = new TextView(this);
        splashTv.setText(SPLASHES[(int)(Math.random() * SPLASHES.length)]);
        splashTv.setTextSize(15); splashTv.setTextColor(Color.YELLOW);
        splashTv.setTypeface(mcFont); splashTv.setGravity(Gravity.CENTER);
        splashTv.setShadowLayer(3, 2, 2, Color.parseColor("#555500"));
        LinearLayout.LayoutParams sP = new LinearLayout.LayoutParams(-1, -2);
        sP.bottomMargin = dp(28);
        col.addView(splashTv, sP);

        final float[] sc = {1.0f};
        final boolean[] grow = {true};
        handler.post(new Runnable() {
            @Override public void run() {
                sc[0] += grow[0] ? 0.012f : -0.012f;
                if (sc[0] >= 1.1f) grow[0] = false;
                if (sc[0] <= 1.0f) grow[0] = true;
                splashTv.setScaleX(sc[0]); splashTv.setScaleY(sc[0]);
                handler.postDelayed(this, 33);
            }
        });

        col.addView(makeMcBtn("▶  Play Game", () -> startActivity(new Intent(this, GameActivity.class))));
        col.addView(makeMcBtn("⚙  Settings",  () -> startActivity(new Intent(this, SettingsActivity.class))));
        col.addView(makeMcBtn("★  About",     () -> startActivity(new Intent(this, AboutActivity.class))));

        TextView verTv = new TextView(this);
        verTv.setText("v3.1.0 · ArnabLabZ Studio");
        verTv.setTextSize(10); verTv.setTextColor(Color.DKGRAY);
        verTv.setTypeface(mcFont); verTv.setGravity(Gravity.CENTER);
        LinearLayout.LayoutParams vP = new LinearLayout.LayoutParams(-1, -2);
        vP.topMargin = dp(22);
        col.addView(verTv, vP);

        root.addView(col);
        setContentView(root);

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

    private Button makeMcBtn(String label, Runnable action) {
        Button b = new Button(this);
        b.setText(label); b.setAllCaps(false);
        b.setTypeface(mcFont);
        b.setTextColor(Color.WHITE); b.setTextSize(17);
        b.setShadowLayer(3, 2, 2, Color.BLACK);
        b.setOnClickListener(v -> action.run());
        if (btnBmp != null) b.setBackground(new BitmapDrawable(getResources(), btnBmp));
        LinearLayout.LayoutParams p = new LinearLayout.LayoutParams(dp(270), dp(52));
        p.setMargins(0, dp(6), 0, dp(6));
        p.gravity = Gravity.CENTER_HORIZONTAL;
        b.setLayoutParams(p);
        return b;
    }

    private int dp(int v) {
        return Math.round(v * getResources().getDisplayMetrics().density);
    }
}
