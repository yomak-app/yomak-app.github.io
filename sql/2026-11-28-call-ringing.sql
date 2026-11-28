-- v73: callee acks "ringing"; caller may re-send the offer (retry) without a second push.
alter table public.call_signals drop constraint if exists call_signals_kind_check;
alter table public.call_signals add constraint call_signals_kind_check check (kind in ('offer','answer','ice','hangup','decline','busy','ringing'));
-- trg_n_call(): offers flagged restart or retry do not notify again (function replaced in place).
