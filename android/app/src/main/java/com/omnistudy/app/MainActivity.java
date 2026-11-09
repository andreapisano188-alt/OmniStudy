package com.omnistudy.app;

import android.os.Bundle;
import android.view.View;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Ensure webview does not draw behind status bar and navigation bar
        WindowCompat.setDecorFitsSystemWindows(getWindow(), true);
        
        View contentView = findViewById(android.R.id.content);
        if (contentView != null) {
            contentView.setFitsSystemWindows(true);
            ViewCompat.setOnApplyWindowInsetsListener(contentView, (v, insets) -> {
                int statusBar = insets.getInsets(WindowInsetsCompat.Type.statusBars()).top;
                int navBar = insets.getInsets(WindowInsetsCompat.Type.navigationBars()).bottom;
                v.setPadding(0, statusBar, 0, navBar);
                return insets;
            });
        }
    }
}
