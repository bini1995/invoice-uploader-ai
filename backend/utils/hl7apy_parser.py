import json
import sys

from hl7apy.parser import parse_message


def main() -> int:
    payload = sys.stdin.read()
    if not payload.strip():
        print(json.dumps({"error": "Empty payload"}))
        return 1

    message = parse_message(payload)
    segments = []
    for segment in message.children:
        fields = []
        for field in segment.children:
            fields.append(field.to_er7())
        segments.append({"name": segment.name, "fields": fields})

    output = {
        "message_type": message.message_type,
        "trigger_event": message.trigger_event,
        "structure": message.structure,
        "segments": segments,
    }
    print(json.dumps(output))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
