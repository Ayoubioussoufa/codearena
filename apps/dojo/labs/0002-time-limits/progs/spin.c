/* Burns CPU forever: the classic infinite loop. */
int main(void)
{
	volatile unsigned long n = 0;

	for (;;)
		n++;
}
