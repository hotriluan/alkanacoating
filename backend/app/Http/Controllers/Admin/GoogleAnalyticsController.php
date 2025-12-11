<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Google\Analytics\Data\V1beta\BetaAnalyticsDataClient;
use Google\Analytics\Data\V1beta\DateRange;
use Google\Analytics\Data\V1beta\Dimension;
use Google\Analytics\Data\V1beta\Metric;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class GoogleAnalyticsController extends Controller
{
    public function fetchAnalytics(Request $request)
    {
        $propertyId = Setting::get('ga_property_id');
        $credentialsPath = 'analytics/service-account-credentials.json';
        $credentialsExist = Storage::disk('local')->exists($credentialsPath);

        if (!$propertyId || !$credentialsExist) {
            $missing = [];
            if (!$propertyId) $missing[] = 'Property ID';
            if (!$credentialsExist) $missing[] = 'tệp JSON xác thực';
            
            return response()->json([
                'error' => 'Google Analytics chưa được cấu hình.',
                'message' => 'Vui lòng vào trang Cài đặt -> Phân tích và cung cấp ' . implode(' và ', $missing) . '.',
            ], 428); // Precondition Required
        }

        try {
            $client = new BetaAnalyticsDataClient([
                'credentials' => Storage::disk('local')->path($credentialsPath)
            ]);

            $response = $client->runReport([
                'property' => 'properties/' . $propertyId,
                'dateRanges' => [
                    new DateRange([
                        'start_date' => '28daysAgo',
                        'end_date' => 'today',
                    ]),
                ],
                'dimensions' => [
                    new Dimension(['name' => 'date']),
                ],
                'metrics' => [
                    new Metric(['name' => 'activeUsers']),
                    new Metric(['name' => 'newUsers']),
                ],
            ]);

            $analyticsData = [];
            foreach ($response->getRows() as $row) {
                $analyticsData[] = [
                    'date' => \DateTime::createFromFormat('Ymd', $row->getDimensionValues()[0]->getValue())->format('Y-m-d'),
                    'activeUsers' => $row->getMetricValues()[0]->getValue(),
                    'newUsers' => $row->getMetricValues()[1]->getValue(),
                ];
            }
            
            // Sort by date ascending
            usort($analyticsData, function($a, $b) {
                return strcmp($a['date'], $b['date']);
            });

            return response()->json($analyticsData);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Không thể lấy dữ liệu từ Google Analytics.',
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
