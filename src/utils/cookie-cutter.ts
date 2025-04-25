const cookieCutter = function (doc) {
  if (!doc) doc = {};
  if (typeof doc === "string") doc = { cookie: doc };
  if (doc.cookie === undefined) doc.cookie = "";

  const self = {
    get: function (key) {
      const splat = doc.cookie.split(/;\s*/);
      for (let i = 0; i < splat.length; i++) {
        const ps = splat[i].split("=");
        const k = unescape(ps[0]);
        if (k === key) return unescape(ps[1]);
      }
      return undefined;
    },
    set: function (key, value, opts) {
      if (!opts) opts = {};
      var s = key + "=" + value;
      if (opts.expires) s += "; expires=" + opts.expires;
      if (opts.path) s += "; path=" + escape(opts.path);
      if (opts.domain) s += "; domain=" + escape(opts.domain);
      if (opts.secure) s += "; secure";
      doc.cookie = s;
      return s;
    },
  };
  return self;
};

export default cookieCutter(document);
