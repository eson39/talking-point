#include <napi.h>

#ifdef __APPLE__
#import <Cocoa/Cocoa.h>
#endif

namespace {

Napi::Value SetWindowSharingNone(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();

#ifndef __APPLE__
  return env.Null();
#else
  if (info.Length() < 1 || !info[0].IsBuffer()) {
    Napi::TypeError::New(env, "Expected Buffer native window handle").ThrowAsJavaScriptException();
    return env.Null();
  }

  auto buf = info[0].As<Napi::Buffer<uint8_t>>();
  if (buf.Length() < sizeof(void*)) {
    Napi::TypeError::New(env, "Handle buffer too small").ThrowAsJavaScriptException();
    return env.Null();
  }

  // Electron on macOS typically returns an NSView* pointer inside the Buffer,
  // but some versions/contexts may provide an NSWindow*.
  void* native = *reinterpret_cast<void* const*>(buf.Data());
  id obj = (__bridge id)native;
  if (obj == nil) return Napi::Boolean::New(env, false);

  NSWindow* window = nil;
  if ([obj isKindOfClass:[NSView class]]) {
    window = [(NSView*)obj window];
  } else if ([obj isKindOfClass:[NSWindow class]]) {
    window = (NSWindow*)obj;
  }
  if (window == nil) return Napi::Boolean::New(env, false);

  // Mark window as non-shareable (Zoom can respect this when window filtering is enabled).
  if (![window respondsToSelector:@selector(setSharingType:)]) {
    return Napi::Boolean::New(env, false);
  }

  [window setSharingType:NSWindowSharingNone];
  return Napi::Boolean::New(env, true);
#endif
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
  exports.Set("setWindowSharingNone", Napi::Function::New(env, SetWindowSharingNone));
  return exports;
}

}  // namespace

NODE_API_MODULE(talking_point_native, Init)

