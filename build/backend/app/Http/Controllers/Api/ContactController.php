<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class ContactController extends Controller
{
    /**
     * Store contact message from public form
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:50',
            'subject' => 'required|string|max:255',
            'message' => 'required|string'
        ]);

        // Create contact record
        $contact = Contact::create($data);

        // Log for monitoring
        Log::info('New contact message received', [
            'id' => $contact->id,
            'name' => $contact->name,
            'email' => $contact->email,
        ]);

        // Optional: Send email notification to admin
        // Uncomment below to enable email notifications
        /*
        try {
            Mail::raw(
                "New contact message from: {$contact->name}\nEmail: {$contact->email}\nSubject: {$contact->subject}\n\nMessage:\n{$contact->message}",
                function ($message) use ($contact) {
                    $message->to(config('mail.admin_email', 'admin@alkanacoating.com'))
                            ->subject("New Contact: {$contact->subject}");
                }
            );
        } catch (\Exception $e) {
            Log::error('Failed to send contact notification email', ['error' => $e->getMessage()]);
        }
        */

        return response()->json([
            'success' => true,
            'message' => 'Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất có thể.',
        ], 201);
    }

    /**
     * Get all contacts (Admin only)
     */
    public function index(Request $request)
    {
        $query = Contact::query()->orderBy('created_at', 'desc');

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Search
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('subject', 'like', "%{$search}%")
                  ->orWhere('message', 'like', "%{$search}%");
            });
        }

        $contacts = $query->paginate($request->get('per_page', 20));

        return response()->json($contacts);
    }

    /**
     * Get single contact (Admin only)
     */
    public function show($id)
    {
        $contact = Contact::findOrFail($id);
        
        // Mark as read if still new
        if ($contact->status === 'new') {
            $contact->markAsRead();
        }

        return response()->json($contact);
    }

    /**
     * Update contact status (Admin only)
     */
    public function update(Request $request, $id)
    {
        $contact = Contact::findOrFail($id);

        $data = $request->validate([
            'status' => 'sometimes|in:new,read,replied,archived',
            'admin_notes' => 'nullable|string',
        ]);

        $contact->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật thành công',
            'data' => $contact,
        ]);
    }

    /**
     * Delete contact (Admin only)
     */
    public function destroy($id)
    {
        $contact = Contact::findOrFail($id);
        $contact->delete();

        return response()->json([
            'success' => true,
            'message' => 'Đã xóa tin nhắn',
        ]);
    }

    /**
     * Get contact statistics (Admin only)
     */
    public function stats()
    {
        return response()->json([
            'total' => Contact::count(),
            'new' => Contact::where('status', 'new')->count(),
            'read' => Contact::where('status', 'read')->count(),
            'replied' => Contact::where('status', 'replied')->count(),
            'archived' => Contact::where('status', 'archived')->count(),
            'today' => Contact::whereDate('created_at', today())->count(),
        ]);
    }
}
