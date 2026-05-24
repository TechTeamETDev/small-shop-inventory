<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;


class AnalyticsUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $payload;

    public function __construct($payload = null)
    {
        $this->payload = $payload;
    }

    public function broadcastOn()
    {
        return new Channel('analytics');
    }

    public function broadcastAs()
    {
        return 'analytics.updated';
    }
}