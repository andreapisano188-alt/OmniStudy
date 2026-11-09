#import <Cocoa/Cocoa.h>
#import <WebKit/WebKit.h>

@interface LocalSchemeHandler : NSObject <WKURLSchemeHandler>
@property (copy, nonatomic) NSString *basePath;
@end

@implementation LocalSchemeHandler

- (void)webView:(WKWebView *)webView startURLSchemeTask:(id<WKURLSchemeTask>)urlSchemeTask {
    NSURL *url = urlSchemeTask.request.URL;
    NSString *path = url.path;
    if (!path || [path isEqualToString:@"/"] || [path length] == 0) {
        path = @"/index.html";
    }
    
    // Remove leading slash
    if ([path hasPrefix:@"/"]) {
        path = [path substringFromIndex:1];
    }
    
    NSString *filePath = [self.basePath stringByAppendingPathComponent:path];
    NSData *data = [NSData dataWithContentsOfFile:filePath];
    
    // Fallback for SPA routing if not found
    if (!data && ![path containsString:@"."]) {
        filePath = [self.basePath stringByAppendingPathComponent:@"index.html"];
        data = [NSData dataWithContentsOfFile:filePath];
    }
    
    if (data) {
        NSString *mimeType = @"text/plain";
        NSString *ext = [[filePath pathExtension] lowercaseString];
        if ([ext isEqualToString:@"html"]) mimeType = @"text/html";
        else if ([ext isEqualToString:@"js"] || [ext isEqualToString:@"mjs"]) mimeType = @"text/javascript";
        else if ([ext isEqualToString:@"css"]) mimeType = @"text/css";
        else if ([ext isEqualToString:@"json"]) mimeType = @"application/json";
        else if ([ext isEqualToString:@"svg"]) mimeType = @"image/svg+xml";
        else if ([ext isEqualToString:@"png"]) mimeType = @"image/png";
        else if ([ext isEqualToString:@"woff2"]) mimeType = @"font/woff2";
        else if ([ext isEqualToString:@"woff"]) mimeType = @"font/woff";
        else if ([ext isEqualToString:@"ttf"]) mimeType = @"font/ttf";
        
        NSDictionary *headers = @{
            @"Content-Type": [NSString stringWithFormat:@"%@; charset=utf-8", mimeType],
            @"Access-Control-Allow-Origin": @"*",
            @"Cache-Control": @"no-cache"
        };
        
        NSHTTPURLResponse *response = [[NSHTTPURLResponse alloc] initWithURL:url
                                                                  statusCode:200
                                                                 HTTPVersion:@"HTTP/1.1"
                                                                headerFields:headers];
        [urlSchemeTask didReceiveResponse:response];
        [urlSchemeTask didReceiveData:data];
        [urlSchemeTask didFinish];
    } else {
        NSLog(@"[LocalSchemeHandler] File not found: %@ (resolved: %@)", path, filePath);
        NSError *error = [NSError errorWithDomain:NSURLErrorDomain code:NSURLErrorFileDoesNotExist userInfo:nil];
        [urlSchemeTask didFailWithError:error];
    }
}

- (void)webView:(WKWebView *)webView stopURLSchemeTask:(id<WKURLSchemeTask>)urlSchemeTask {
}

@end

@interface AppDelegate : NSObject <NSApplicationDelegate, WKNavigationDelegate, WKUIDelegate, WKScriptMessageHandler>
@property (strong, nonatomic) NSWindow *window;
@property (strong, nonatomic) WKWebView *webView;
@property (strong, nonatomic) LocalSchemeHandler *schemeHandler;
@end

@implementation AppDelegate

- (void)userContentController:(WKUserContentController *)userContentController didReceiveScriptMessage:(WKScriptMessage *)message {
    NSLog(@"[OmniStudy Web JS] %@", message.body);
}

- (void)applicationDidFinishLaunching:(NSNotification *)aNotification {
    NSRect frame = NSMakeRect(100, 100, 1280, 840);
    NSUInteger style = NSWindowStyleMaskTitled | NSWindowStyleMaskClosable | NSWindowStyleMaskMiniaturizable | NSWindowStyleMaskResizable | NSWindowStyleMaskFullSizeContentView;
    
    self.window = [[NSWindow alloc] initWithContentRect:frame
                                              styleMask:style
                                                backing:NSBackingStoreBuffered
                                                  defer:NO];
    [self.window setTitle:@"OmniStudy"];
    [self.window setTitleVisibility:NSWindowTitleHidden];
    [self.window setTitlebarAppearsTransparent:YES];
    [self.window setMinSize:NSMakeSize(800, 550)];
    [self.window center];
    
    // Find web resources directory
    NSString *resourcePath = [[NSBundle mainBundle] resourcePath];
    NSString *webPath = [resourcePath stringByAppendingPathComponent:@"web"];
    NSLog(@"[OmniStudy] Resources webPath: %@", webPath);
    
    WKWebViewConfiguration *config = [[WKWebViewConfiguration alloc] init];
    self.schemeHandler = [[LocalSchemeHandler alloc] init];
    self.schemeHandler.basePath = webPath;
    
    [config setURLSchemeHandler:self.schemeHandler forURLScheme:@"app"];
    
    // Console log forwarding
    WKUserContentController *ucc = [[WKUserContentController alloc] init];
    NSString *jsLogging = 
        @"console.log = (function(oldLog) { return function() { oldLog.apply(console, arguments); try { window.webkit.messageHandlers.log.postMessage(Array.from(arguments).map(String).join(' ')); } catch(e){} }; })(console.log); "
        @"console.error = (function(oldErr) { return function() { oldErr.apply(console, arguments); try { window.webkit.messageHandlers.log.postMessage('ERROR: ' + Array.from(arguments).map(String).join(' ')); } catch(e){} }; })(console.error); "
        @"window.onerror = function(msg, url, line) { try { window.webkit.messageHandlers.log.postMessage('UNCAUGHT: ' + msg + ' at ' + url + ':' + line); } catch(e){} };";
    
    WKUserScript *script = [[WKUserScript alloc] initWithSource:jsLogging injectionTime:WKUserScriptInjectionTimeAtDocumentStart forMainFrameOnly:NO];
    [ucc addUserScript:script];
    [ucc addScriptMessageHandler:self name:@"log"];
    config.userContentController = ucc;
    
    self.webView = [[WKWebView alloc] initWithFrame:frame configuration:config];
    [self.webView setAutoresizingMask:NSViewWidthSizable | NSViewHeightSizable];
    [self.webView setNavigationDelegate:self];
    [self.webView setUIDelegate:self];
    
    #if defined(__MAC_13_3)
    if (@available(macOS 13.3, *)) {
        [self.webView setInspectable:YES];
    }
    #endif
    
    NSURL *appURL = [NSURL URLWithString:@"app://localhost/index.html"];
    [self.webView loadRequest:[NSURLRequest requestWithURL:appURL]];
    
    [self.window setContentView:self.webView];
    [self.window makeKeyAndOrderFront:nil];
    [NSApp activateIgnoringOtherApps:YES];
}

- (void)webView:(WKWebView *)webView didFailNavigation:(WKNavigation *)navigation withError:(NSError *)error {
    NSLog(@"[OmniStudy] didFailNavigation: %@", error);
}

- (void)webView:(WKWebView *)webView didFailProvisionalNavigation:(WKNavigation *)navigation withError:(NSError *)error {
    NSLog(@"[OmniStudy] didFailProvisionalNavigation: %@", error);
}

- (BOOL)applicationShouldTerminateAfterLastWindowClosed:(NSApplication *)sender {
    return YES;
}

@end

int main(int argc, const char * argv[]) {
    @autoreleasepool {
        NSApplication *app = [NSApplication sharedApplication];
        AppDelegate *delegate = [[AppDelegate alloc] init];
        [app setDelegate:delegate];
        [app run];
    }
    return 0;
}
