<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class LogRequests
{
    public function handle(Request $request, Closure $next)
    {
        $logMessage = date('Y-m-d H:i:s') . " - " . $request->method() . " " . $request->getPathInfo();
        
        if ($request->hasFile('image')) {
            $logMessage .= " (HAS IMAGE FILE)";
        }
        
        if ($request->has('_method')) {
            $logMessage .= " (_method: " . $request->get('_method') . ")";
        }
        
        file_put_contents(storage_path('logs/requests.log'), $logMessage . "\n", FILE_APPEND);

        return $next($request);
    }
}