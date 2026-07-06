package io.craftsprint;

import android.app.Activity;
import android.content.Context;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.BitmapDrawable;
import android.graphics.drawable.GradientDrawable;
import android.opengl.GLSurfaceView;
import android.os.Bundle;
import android.view.Gravity;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.TextView;
import java.io.InputStream;
import javax.microedition.khronos.egl.EGLConfig;
import javax.microedition.khronos.opengles.GL10;

public class GameActivity extends Activity {

    static { System.loadLibrary("craftsprint"); }

    private native void    init(int w, int h);
    private native void    step(float dt);
    private native void    handleSwipe(float dx, float dy);
    private native int     getScore();
    private native int     getDistance();
    private native void    setHighScore(int s);
    private native int     getHighScore();
    private native int     getComboBonus();
    private native boolean isGameOver();
    private native void    stopGame();
    private native void    restartGame();

    // Views
    private GLSurfaceView glView;
    private TextView      scoreTv, comboTv, biomeTv, diedTv;
    private View          distBarFill;
    private FrameLayout   gameOverLayout;
    private TextView      finalScoreTv, highScoreTv, deathMsgTv;

    // State
    private float   startX, startY;
    private boolean lastGameOver = false;
    private int     lastBiome   = -1;
    private int     lastScore   = -1;
    private int     lastCombo   = -1;
    private int     lastDist    = -1;

    private Typeface mcFont;
    private Bitmap   btnBmp;

    private static final String[] DEATH_MSGS = {
        "Steve was blown up by TNT",
        "Steve tried to swim in lava",
        "Steve fell from a high place",
        "Steve was slain by a Creeper",
        "Steve burned to a crisp"
    };
    private static final String[] BIOME_EMOJIS = {
        "🌿 Plains", "🌵 Desert", "🔥 Nether", "❄ Snowy"
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Full screen, keep screen on
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN |
                             WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        try {
            mcFont = Typeface.createFromAsset(getAssets(), "fonts/Minecraft.ttf");
            InputStream bi = getAssets().open("button_bg.png");
            btnBmp = BitmapFactory.decodeStream(bi);
        } catch (Exception e) { mcFont = Typeface.DEFAULT_BOLD; }

        FrameLayout root = new FrameLayout(this);
        root.setLayoutParams(new ViewGroup.LayoutParams(-1, -1));

        // ── GL Surface — MATCH_PARENT ──────────────────────────
        glView = new GLSurfaceView(this);
        glView.setEGLContextClientVersion(2);
        glView.setRenderer(new GLSurfaceView.Renderer() {
            private long lastNs = System.nanoTime();
            public void onSurfaceCreated(GL10 gl, EGLConfig cfg) { lastNs = System.nanoTime(); }
            public void onSurfaceChanged(GL10 gl, int w, int h)  { init(w, h); }
            public void onDrawFrame(GL10 gl) {
                long now = System.nanoTime();
                float dt = (now - lastNs) / 1_000_000_000f;
                if (dt > 0.1f) dt = 1f / 60f;
                lastNs = now;
                step(dt);
                runOnUiThread(GameActivity.this::syncUI);
            }
        });
        root.addView(glView, new FrameLayout.LayoutParams(-1, -1)); // MATCH_PARENT both

        // ── HUD top ────────────────────────────────────────────
        LinearLayout hudTop = new LinearLayout(this);
        hudTop.setOrientation(LinearLayout.HORIZONTAL);
        hudTop.setPadding(dp(12), dp(12), dp(12), 0);
        hudTop.setGravity(Gravity.CENTER_VERTICAL);

        scoreTv = makePillTv("Score: 0", 16, Color.WHITE);
        biomeTv = makePillTv("🌿 Plains", 11, Color.parseColor("#55ffff"));
        comboTv = makePillTv("×1", 14, Color.YELLOW);
        comboTv.setVisibility(View.GONE);

        LinearLayout.LayoutParams scoreLP = new LinearLayout.LayoutParams(0, -2, 1f);
        hudTop.addView(scoreTv, scoreLP);
        hudTop.addView(biomeTv);
        hudTop.addView(comboTv);

        root.addView(hudTop, new FrameLayout.LayoutParams(-1, -2, Gravity.TOP));

        // ── Distance bar (bottom strip) ────────────────────────
        FrameLayout distBarWrap = new FrameLayout(this);
        distBarWrap.setBackgroundColor(Color.parseColor("#55000000"));
        distBarFill = new View(this);
        distBarFill.setBackgroundColor(Color.parseColor("#55ff55"));
        distBarWrap.addView(distBarFill,
            new FrameLayout.LayoutParams(0, -1));  // width set dynamically
        root.addView(distBarWrap,
            new FrameLayout.LayoutParams(-1, dp(5), Gravity.BOTTOM));

        // ── Death Screen ───────────────────────────────────────
        gameOverLayout = new FrameLayout(this);
        gameOverLayout.setBackgroundColor(Color.parseColor("#AA640000"));
        gameOverLayout.setVisibility(View.GONE);

        // YOU DIED
        diedTv = new TextView(this);
        diedTv.setText("YOU DIED!");
        diedTv.setTextSize(48); diedTv.setTextColor(Color.WHITE);
        diedTv.setTypeface(mcFont); diedTv.setGravity(Gravity.CENTER);
        diedTv.setShadowLayer(10, 5, 5, Color.BLACK);
        FrameLayout.LayoutParams dp1 = new FrameLayout.LayoutParams(-1, -2, Gravity.CENTER);
        dp1.bottomMargin = dp(200);
        gameOverLayout.addView(diedTv, dp1);

        // Death cause
        deathMsgTv = new TextView(this);
        deathMsgTv.setTextSize(13); deathMsgTv.setTextColor(Color.LTGRAY);
        deathMsgTv.setTypeface(mcFont); deathMsgTv.setGravity(Gravity.CENTER);
        FrameLayout.LayoutParams dp2 = new FrameLayout.LayoutParams(-1, -2, Gravity.CENTER);
        dp2.bottomMargin = dp(140);
        gameOverLayout.addView(deathMsgTv, dp2);

        // Final score
        finalScoreTv = new TextView(this);
        finalScoreTv.setTextSize(20); finalScoreTv.setTextColor(Color.parseColor("#ffffa0"));
        finalScoreTv.setTypeface(mcFont); finalScoreTv.setGravity(Gravity.CENTER);
        FrameLayout.LayoutParams dp3 = new FrameLayout.LayoutParams(-1, -2, Gravity.CENTER);
        dp3.bottomMargin = dp(80);
        gameOverLayout.addView(finalScoreTv, dp3);

        // High score
        highScoreTv = new TextView(this);
        highScoreTv.setTextSize(14); highScoreTv.setTextColor(Color.parseColor("#55ff55"));
        highScoreTv.setTypeface(mcFont); highScoreTv.setGravity(Gravity.CENTER);
        FrameLayout.LayoutParams dp4 = new FrameLayout.LayoutParams(-1, -2, Gravity.CENTER);
        dp4.bottomMargin = dp(30);
        gameOverLayout.addView(highScoreTv, dp4);

        // Buttons row — centered
        LinearLayout btnRow = new LinearLayout(this);
        btnRow.setOrientation(LinearLayout.HORIZONTAL);
        btnRow.setGravity(Gravity.CENTER);
        btnRow.addView(makeMcBtn("⚔ Respawn", dp(50), v -> {
            restartGame();
            gameOverLayout.setVisibility(View.GONE);
            lastGameOver = false;
            lastScore = -1;
            lastCombo = -1;
            lastDist = -1;
            lastBiome = -1;
            comboTv.setVisibility(View.GONE);
        }));
        btnRow.addView(makeMcBtn("🏠 Title", dp(50), v -> {
            stopGame();
            finish();
        }));
        FrameLayout.LayoutParams brP = new FrameLayout.LayoutParams(-2, -2, Gravity.CENTER);
        brP.topMargin = dp(80);
        gameOverLayout.addView(btnRow, brP);

        root.addView(gameOverLayout, new FrameLayout.LayoutParams(-1, -1));
        setContentView(root);
    }

    // ── syncUI ────────────────────────────────────────────────────
    private void syncUI() {
        int score  = getScore();
        int dist   = getDistance();
        int combo  = getComboBonus();
        boolean go = isGameOver();

        if (score != lastScore) {
            scoreTv.setText("Score: " + score);
            lastScore = score;
        }

        if (combo != lastCombo) {
            if (combo > 1) {
                comboTv.setText("×" + combo + " COMBO");
                comboTv.setVisibility(View.VISIBLE);
            } else {
                comboTv.setVisibility(View.GONE);
            }
            lastCombo = combo;
        }

        // Biome — USE ACTUAL DISTANCE
        int biome = 0;
        if      (dist > 2000) biome = 2;
        else if (dist > 1000) biome = 3;
        else if (dist > 400)  biome = 1;
        if (biome != lastBiome) {
            lastBiome = biome;
            biomeTv.setText(BIOME_EMOJIS[biome]);
            // Flash effect for biome change (Android parity)
            biomeTv.animate().scaleX(1.2f).scaleY(1.2f).setDuration(100).withEndAction(() -> 
                biomeTv.animate().scaleX(1f).scaleY(1f).setDuration(100).start()).start();
        }

        // Distance bar (Gradient style parity)
        if (dist != lastDist) {
            float pct = Math.min(dist / 2500f, 1f);
            View wrap = (View) distBarFill.getParent();
            if (wrap != null && wrap.getWidth() > 0) {
                ViewGroup.LayoutParams lp = distBarFill.getLayoutParams();
                lp.width = (int)(wrap.getWidth() * pct);
                distBarFill.setLayoutParams(lp);
                
                // Sync with gradient logic
                GradientDrawable gd = new GradientDrawable(GradientDrawable.Orientation.LEFT_RIGHT, 
                    new int[] {Color.parseColor("#55ff55"), Color.parseColor("#ffff00"), Color.parseColor("#ff5555")});
                distBarFill.setBackground(gd);
            }
            lastDist = dist;
        }

        // Game over
        if (go && !lastGameOver) {
            // Death animation parity
            gameOverLayout.setAlpha(0f);
            gameOverLayout.animate().alpha(1f).setDuration(400).start();
            
            // Wobble effect
            diedTv.animate().scaleX(1.1f).scaleY(1.1f).setDuration(300).withEndAction(() ->
                diedTv.animate().scaleX(1f).scaleY(1f).setDuration(300).start()).start();
                
            lastGameOver = true;
            deathMsgTv.setText(DEATH_MSGS[(int)(Math.random() * DEATH_MSGS.length)]);
            finalScoreTv.setText("Score: " + score);

            SharedPreferences prefs = getSharedPreferences("craftsprint", Context.MODE_PRIVATE);
            int saved = prefs.getInt("cs_best", 0);
            if (score > saved) {
                prefs.edit().putInt("cs_best", score).apply();
                highScoreTv.setText("🏆 New Best!");
            } else {
                highScoreTv.setText("Best: " + saved);
            }
            gameOverLayout.setVisibility(View.VISIBLE);
        }
    }

    // ── Touch ─────────────────────────────────────────────────────
    @Override
    public boolean onTouchEvent(MotionEvent e) {
        if (lastGameOver) return true;
        switch (e.getAction()) {
            case MotionEvent.ACTION_DOWN:
                startX = e.getX(); startY = e.getY(); break;
            case MotionEvent.ACTION_UP:
                handleSwipe(e.getX() - startX, startY - e.getY()); break;
        }
        return true;
    }

    @Override protected void onPause()  { super.onPause();  glView.onPause();  }
    @Override protected void onResume() { super.onResume(); glView.onResume(); }

    // ── Helpers ───────────────────────────────────────────────────
    private TextView makePillTv(String text, int sp, int color) {
        TextView tv = new TextView(this);
        tv.setText(text); tv.setTextSize(sp); tv.setTextColor(color);
        tv.setTypeface(mcFont);
        tv.setShadowLayer(3, 2, 2, Color.BLACK);
        // Sync with Web: rgba(0,0,0,0.55), 2px solid border
        tv.setBackgroundColor(Color.parseColor("#88000000"));
        GradientDrawable border = new GradientDrawable();
        border.setColor(Color.parseColor("#88000000"));
        border.setStroke(dp(2), Color.parseColor("#40FFFFFF"));
        tv.setBackground(border);
        tv.setPadding(dp(12), dp(6), dp(12), dp(6));
        return tv;
    }

    private Button makeMcBtn(String text, int heightPx, View.OnClickListener clk) {
        Button b = new Button(this);
        b.setText(text); b.setTypeface(mcFont);
        b.setTextColor(Color.WHITE); b.setTextSize(16); // Sync size
        b.setAllCaps(false);
        b.setShadowLayer(3, 2, 2, Color.BLACK);
        b.setOnClickListener(clk);
        // Sync with Web: pixelated button style
        if (btnBmp != null) {
            b.setBackground(new BitmapDrawable(getResources(), btnBmp));
        } else {
            GradientDrawable gd = new GradientDrawable();
            gd.setColor(Color.parseColor("#555555"));
            gd.setStroke(dp(3), Color.BLACK);
            b.setBackground(gd);
        }
        LinearLayout.LayoutParams p = new LinearLayout.LayoutParams(dp(200), heightPx); // Sync width
        p.setMargins(dp(8), dp(8), dp(8), dp(8));
        b.setLayoutParams(p);
        return b;
    }

    private int dp(int v) {
        return Math.round(v * getResources().getDisplayMetrics().density);
    }
}
